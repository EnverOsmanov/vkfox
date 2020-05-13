"use strict";
import RequestBg from "../request/request.bg";
import * as _ from "lodash"
import Mediator from "../../mediator/mediator.bg"
import {Msg} from "../../mediator/messages"
import {GProfileCollCmpn} from "../profiles-collection/profiles-collection.bg";
import {AccessTokenError} from "../request/models";
import {markAsOfflineIfModeOnOnce} from "../force-online/force-online.bg";
import {
    FriendItem,
    ItemObj,
    media,
    Newsfeed,
    NewsfeedRequestParams,
    NewsfeedResp, NoteItem, PhotoItem, PhotoTagItem,
    PostItem,
    UserId,
    WallPhotoItem
} from "../../../vk/types/newsfeed";
import {LikesChanged} from "./types";
import {AttachmentPhotoContainer} from "../../../vk/types/attachment";
import {ProfileI, UserProfile} from "../../common/users/types";
import {idMaker} from "../../common/feedbacks/id";

/**
 * Responsible for "News -> Friends", "News -> Groups" pages
 *
 */


const MAX_ITEMS_COUNT = 50,
    UPDATE_PERIOD     = 10000; //ms


const profilesColl: Map<number, ProfileI> = new Map();
const groupItemsColl: ItemObj[] = [];
const friendItemsColl: ItemObj[] = [];

const autoUpdateParams: NewsfeedRequestParams = {
    count: MAX_ITEMS_COUNT
};

/**
 * Generates unique id for every item,
 * or merges new item into existing one with the same id;
 * For example new wall_photos will be merged with existing for the user
 */
function processRawItem(item: ItemObj) {
/*    const typeToPropertyMap = {
        "wall_photo": "photos",
        "photo"     : "photos",
        "photo_tag" : "photo_tags",
        "note"      : "notes",
        "friend"    : "friends"
    };*/

    const itemId = idMaker(item);

    const itemsColl = item.source_id > 0
        ? friendItemsColl
        : groupItemsColl;

    const collisionItem = itemsColl.find(el => idMaker(el) == itemId);

    if (collisionItem) {
        switch(collisionItem.type) {
            case "photo":
            case "wall_photo": {
                const p = (item as WallPhotoItem | PhotoItem)
                const collection = p.photos.items.concat(collisionItem.photos.items);

                p.photos = {
                    count: collection.length,
                    items: collection
                }
                break;
            }

            case "photo_tag": {
                const p = (item as PhotoTagItem)
                const collection = p.photo_tags.items.concat(collisionItem.photo_tags.items);

                p.photo_tags = {
                    count: collection.length,
                    items: collection
                }
                break;
            }

            case "note": {
                const p = (item as NoteItem)
                const collection = p.notes.items.concat(collisionItem.notes.items);

                p.notes = {
                    count: collection.length,
                    items: collection
                }
                break;
            }

            case "friend": {
                const p = (item as FriendItem)
                const collection = p.friends.items.concat(collisionItem.friends.items);

                p.friends = {
                    count: collection.length,
                    items: collection
                }
                break;
            }
            default: break;
        }
        itemsColl.splice(itemsColl.indexOf(collisionItem), 1);
    }

    itemsColl.push(item);
}

/**
 * API returns "wall_photo" item for every post item with photo.
 *
 * @param {Array} items
 * return {Array} filtered array of items
 */
function discardOddWallPhotos(items: ItemObj[]): ItemObj[] {
    return items.filter( item => {
        let wallPhotos: media.Photo[];

        if (item.type === "wall_photo") {
            const wallPhotoItem = item as WallPhotoItem;
            wallPhotos = wallPhotoItem.photos.items;

            // collect all attachments from source_id's posts
            const postProperties = {
                type: "post",
                source_id: item.source_id
            };

            function takePhotos(attachedPhotos: media.Photo[], post: PostItem): media.Photo[] {
                if (post.attachments) {
                    const curPhotos = _
                        .filter(post.attachments, { type: "photo" })
                        .map( (attachment: AttachmentPhotoContainer) => attachment.photo );

                    return attachedPhotos.concat(curPhotos);
                }
                else return attachedPhotos;
            }


            const attachedPhotos = _
                .filter(items, postProperties)
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
    if (friendItemsColl.length > MAX_ITEMS_COUNT || groupItemsColl.length > MAX_ITEMS_COUNT) {

        let required_uids: number[];

        // slice items
        friendItemsColl.length = MAX_ITEMS_COUNT;
        groupItemsColl.length = MAX_ITEMS_COUNT;

        // gather required profiles' ids from new friends
        required_uids = _.chain(
            friendItemsColl
                .filter( el => el.type == "friend")
                // first element contains quantity
                .map( model => (model as FriendItem).friends.items || [])
        )
            .flatten()
            .map((f: UserId) => f.user_id)
            .value();

        // gather required profiles from source_ids
        required_uids = _.uniq(required_uids.concat(
            groupItemsColl.map(gi => Math.abs(gi.source_id)),
            friendItemsColl.map(fi => fi.source_id)
        ));

        profilesColl.forEach(p => {
            if (!required_uids.includes(p.id)) profilesColl.delete(p.id)
        });
    }
}

function fetchNewsfeed(): Promise<number | object> {
    const code = "return {" +
        `newsfeed: API.newsfeed.get(${ JSON.stringify(autoUpdateParams) }),` +
        "time: API.utils.getServerTime() };";

    function responseHandler(response: NewsfeedResp) {
        const {newsfeed, time} = response;

        if (newsfeed) {
            const newsfeedObj = newsfeed as Newsfeed;
            autoUpdateParams.start_time = time;

            newsfeedObj.profiles.forEach(p => profilesColl.set(p.id, p));
            newsfeedObj.groups.forEach(p => profilesColl.set(p.id, p));

            discardOddWallPhotos(newsfeedObj.items).forEach(processRawItem);

            // try to remove old items, if new were inserted
            if (newsfeedObj.items.length) freeSpace();

            friendItemsColl.sort(itemObjSorter)
            groupItemsColl.sort(itemObjSorter)

            return markAsOfflineIfModeOnOnce();
        }
        else return Promise.resolve()
    }

    function handleError(e: Error) {
        if (e instanceof AccessTokenError) {
            console.error("Fetch newsfeed failed... Retrying", e.message)
        }
        else console.error("Fetch newsfeed failed... Retrying", e);
    }

    return RequestBg
        .api<NewsfeedResp>({ code })
        .then(responseHandler)
        .catch(handleError)
        .then( () => setTimeout(fetchNewsfeed, UPDATE_PERIOD));
}

function onLikesChanged(params: LikesChanged): void {

    function whereClause(el: PostItem): boolean {
        return el.type     == params.type &&
        el.source_id == params.owner_id &&
        el.post_id  == params.item_id
    }

    const model = params.owner_id > 0
        ? friendItemsColl.find(whereClause)
        : groupItemsColl.find(whereClause);

    if (model) (model as PostItem).likes = params.likes;

    if (params.owner_id > 0) publishNewsfeedFriends()
    else publishNewsfeedGroups()
}

function onChangeUser(): void {
    profilesColl.clear();
    groupItemsColl.length = 0;
    friendItemsColl.length = 0;
}


/**
* Initialize all variables
*/

export default function initialize() {
    GProfileCollCmpn.subscribeForLpUpdates(profilesColl as Map<number, UserProfile>);

    Mediator.sub(Msg.AuthUser, onChangeUser);

    const readyPromise = fetchNewsfeed();

// Subscribe to events from popup
    Mediator.sub(Msg.NewsfeedFriendsGet, () => readyPromise.then(publishNewsfeedFriends) );

    Mediator.sub(Msg.NewsfeedGroupsGet, () => readyPromise.then(publishNewsfeedGroups) );

    readyPromise.then( () => {
        Mediator.sub(Msg.LikesChanged, onLikesChanged);
    });

}

function publishNewsfeedFriends() {
    Mediator.pub(Msg.NewsfeedFriends, {
        profiles: [...profilesColl],
        items   : friendItemsColl
    });
}

function publishNewsfeedGroups() {
    Mediator.pub(Msg.NewsfeedGroups, {
        profiles: [...profilesColl],
        items   : groupItemsColl
    });
}


function itemObjSorter(a: ItemObj, b: ItemObj): number {
    return b.date - a.date;
}