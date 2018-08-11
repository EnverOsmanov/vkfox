"use strict";
import RequestBg from "../../request/request.bg";
import * as _ from "underscore"
import Mediator from "../../mediator/mediator.bg"
import {Msg} from "../../mediator/messages"
import {Profiles, BBCollectionOps} from "../../common/profiles-collection/profiles-collection.bg";
import {ItemDulpColl, ItemsColl, } from "./helper/models";
import {AccessTokenError} from "../../request/models";
import {markAsOfflineIfModeOn} from "../force-online/force-online.bg";
import {
    AttachmentPhoto,
    AttachmentPhotoContainer,
    ItemObj,
    NewsfeedRequestParams,
    NewsfeedResp,
    PostItem,
    UserId,
    WallPhotoItem
} from "../../../vk/types/newsfeed";
import {LikesChanged} from "./types";

/**
 * Responsible for "News -> Friends", "News -> Groups" pages
 *
 */


const MAX_ITEMS_COUNT = 50,
    UPDATE_PERIOD     = 10000; //ms


const profilesColl = new Profiles();
const groupItemsColl = new ItemsColl();
const friendItemsColl = new ItemsColl();

const autoUpdateParams: NewsfeedRequestParams = {
    count: MAX_ITEMS_COUNT
};

//
//
//Functions

export function idMaker(item: ItemObj): string {
    const post_id = "post_id" in item ? (item as PostItem).post_id : "";

    return [item.source_id, post_id, item.type].join(":");
}

/**
 * Generates unique id for every item,
 * or merges new item into existing one with the same id;
 * For example new wall_photos will be merged with existing for the user
 */
function processRawItem(item: ItemObj) {
    let collisionItem;
    const typeToPropertyMap = {
        "wall_photo": "photos",
        "photo"     : "photos",
        "photo_tag" : "photo_tags",
        "note"      : "notes",
        "friend"    : "friends"
    };

    // used to eliminate duplicate items during merge
    const collection = new ItemDulpColl();


    item.id = idMaker(item);

    if (item.source_id > 0) {
        collisionItem = friendItemsColl.get(item.id);
        friendItemsColl.remove(collisionItem);
    }
    else {
        collisionItem = groupItemsColl.get(item.id);
        groupItemsColl.remove(collisionItem);
    }

    if (collisionItem) {
        collisionItem = collisionItem.toJSON();

        const propertyName = typeToPropertyMap[collisionItem.type];

        if (propertyName) {
            // type "photo" item has "photos" property; note - notes etc

            collection.add(item[propertyName].items, BBCollectionOps.addOptions);
            collection.add(collisionItem[propertyName].items, BBCollectionOps.addOptions);

            item[propertyName] = {
                count: collection.size(),
                items: collection.toJSON()
            }
        }
    }

    if (item.source_id > 0) friendItemsColl.add(item);
    else groupItemsColl.add(item);
}

/**
 * API returns "wall_photo" item for every post item with photo.
 *
 * @param {Array} items
 * return {Array} filtered array of items
 */
function discardOddWallPhotos(items: ItemObj[]): ItemObj[] {
    return items.filter( item => {
        let wallPhotos: AttachmentPhoto[];

        if (item.type === "wall_photo") {
            const wallPhotoItem = item as WallPhotoItem;
            wallPhotos = wallPhotoItem.photos.items;

            // collect all attachments from source_id's posts
            const postProperties = {
                type: "post",
                source_id: item.source_id
            };

            function takePhotos(attachedPhotos: AttachmentPhoto[], post: PostItem): AttachmentPhoto[] {
                if (post.attachments) {
                    const curPhotos = _
                        .where(post.attachments, { type: "photo" })
                        .map( (attachment: AttachmentPhotoContainer) => attachment.photo );

                    return attachedPhotos.concat(curPhotos);
                }
                else return attachedPhotos;
            }


            const attachedPhotos = _
                .where(items, postProperties)
                .reduce(takePhotos, []);

            //exclude attachedPhotos from wallPhotos
            wallPhotos = wallPhotos
                .filter( wallP => !attachedPhotos.some( attachedP => attachedP.id === wallP.id) );


            wallPhotoItem.photos = {
                count: wallPhotos.length,
                items: wallPhotos
            };

            return  wallPhotos.length;
        }
        return true;
    });
}
/**
 * Deletes items, when there are more then MAX_ITEMS_COUNT.
 * Also removes unnecessary profiles after that
 */
function freeSpace() {
    if (friendItemsColl.size() > MAX_ITEMS_COUNT || groupItemsColl.size() > MAX_ITEMS_COUNT) {

        let required_uids: number[];

        // slice items
        friendItemsColl.reset(friendItemsColl.slice(0, MAX_ITEMS_COUNT));
        groupItemsColl.reset(groupItemsColl.slice(0, MAX_ITEMS_COUNT));

        // gather required profiles' ids from new friends
        required_uids = _(
            friendItemsColl
                .where({ type: "friend" })
                // first element contains quantity
                .map( model => (model.friends.items || []) )
        ).chain()
            .flatten()
            .map((f: UserId) => f.user_id)
            .value();

        // gather required profiles from source_ids
        required_uids = _(required_uids.concat(
            groupItemsColl.map(gi => Math.abs(gi.source_id)),
            friendItemsColl.map(fi => fi.source_id)
        )).uniq();

        profilesColl.reset(profilesColl.filter(
            model => required_uids.indexOf(model.id) !== -1
        ));
    }
}

function fetchNewsfeed(): Promise<number | void> {
    const code = "return {" +
        `newsfeed: API.newsfeed.get(${ JSON.stringify(autoUpdateParams) }),` +
        "time: API.utils.getServerTime() };";

    function responseHandler(response: NewsfeedResp) {
        const {newsfeed, time} = response;

        autoUpdateParams.start_time = time;

        profilesColl.add(newsfeed.profiles, BBCollectionOps.addOptions);
        profilesColl.add(newsfeed.groups, BBCollectionOps.addOptions);

        discardOddWallPhotos(newsfeed.items).forEach(processRawItem);

        // try to remove old items, if new were inserted
        if (newsfeed.items.length) freeSpace();

        setTimeout(fetchNewsfeed, UPDATE_PERIOD);
        return markAsOfflineIfModeOn();
    }

    function handleError(e: Error) {
        if (e instanceof AccessTokenError) {
            console.error("Fetch newsfeed failed... Retrying", e.message)
        }
        else console.error("Fetch newsfeed failed... Retrying", e);

        setTimeout(fetchNewsfeed, UPDATE_PERIOD);
    }

    return RequestBg
        .api<NewsfeedResp>({ code })
        .then(responseHandler)
        .catch(handleError);
}

function onLikesChanged(params: LikesChanged): void {

    const whereClause = {
        type     : params.type,
        source_id: params.owner_id,
        post_id  : params.item_id
    };

    const model = params.owner_id > 0
        ? friendItemsColl.findWhere(whereClause)
        : groupItemsColl.findWhere(whereClause);

    if (model) model.likes = params.likes;
}

function onChangeUser(): void {
    profilesColl.reset();
    groupItemsColl.reset();
    friendItemsColl.reset();
}


/**
* Initialize all variables
*/

export default function initialize() {
    Mediator.sub(Msg.AuthUser, onChangeUser);

    const readyPromise = fetchNewsfeed();

// Subscribe to events from popup
    Mediator.sub(Msg.NewsfeedFriendsGet, () => readyPromise.then(publishNewsfeedFriends) );

    Mediator.sub(Msg.NewsfeedGroupsGet, () => readyPromise.then(publishNewsfeedGroups) );

    readyPromise.then( () => Mediator.sub(Msg.LikesChanged, onLikesChanged) );

    readyPromise.then( () => {
        Mediator.sub(Msg.LikesChanged, onLikesChanged);

        groupItemsColl.on("change add", _.debounce(publishNewsfeedGroups, 0), 0);
        friendItemsColl.on("change add", _.debounce(publishNewsfeedFriends, 0), 0);
    });

}

function publishNewsfeedFriends() {
    Mediator.pub(Msg.NewsfeedFriends, {
        profiles: profilesColl.toJSON(),
        items   : friendItemsColl.toJSON()
    });
}

function publishNewsfeedGroups() {
    Mediator.pub(Msg.NewsfeedGroups, {
        profiles: profilesColl.toJSON(),
        items   : groupItemsColl.toJSON()
    });
}
