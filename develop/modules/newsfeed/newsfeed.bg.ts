"use strict";
import Request from '../request/request.bg';
import * as _ from "underscore"
import Tracker from "../tracker/tracker"
import Mediator from "../mediator/mediator.bg"
import Msg from "../mediator/messages"
import {Profiles} from "../feedbacks/collections/ProfilesColl";
import {Item, ItemDulpColl, ItemObj, ItemsColl, LikesChanged, NewsfeedResp, Photo, Post, ProfilesColl} from "./models";

/**
 * Responsible for "News -> Friends", "News -> Groups" pages
 *
 */


const MAX_ITEMS_COUNT = 50,
    UPDATE_PERIOD     = 10000; //ms


const profilesColl = new ProfilesColl();
const groupItemsColl = new ItemsColl();
const friendItemsColl = new ItemsColl();

const autoUpdateParams: { count: number, start_time?: number } = {
    count: MAX_ITEMS_COUNT
};

//
//
//Functions

/**
 * Generates unique id for every item,
 * or merges new item into existing one with the same id;
 * For example new wall_photos will be merged with existing for the user
 */
function processRawItem(item: ItemObj) {
    let collisionItem;
    const typeToPropertyMap = {
        'wall_photo': 'photos',
        'photo'     : 'photos',
        'photo_tag' : 'photo_tags',
        'note'      : 'notes',
        'friend'    : 'friends'
    };

    // used to eliminate duplicate items during merge
    const collection = new ItemDulpColl();

    item.id = [item.source_id, item.post_id, item.type].join(':');

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


            try {
                collection.add(item[propertyName].slice(1), Profiles.addOptions);
                collection.add(collisionItem[propertyName].slice(1), Profiles.addOptions);

                item[propertyName] = [collection.size()].concat(collection.toJSON());
            }
            catch (event) { Tracker.debug(collisionItem, item, event); }
        }
    }

    if (item.source_id > 0) friendItemsColl.add(item, {at: 0});
    else groupItemsColl.add(item, {at: 0});
}

/**
 * API returns 'wall_photo' item for every post item with photo.
 *
 * @param {Array} items
 * return {Array} filtered array of items
 */
function discardOddWallPhotos(items: ItemObj[]): ItemObj[] {
    return items.filter(function (item) {
        let wallPhotos: Photo[];

        if (item.type === 'wall_photo') {
            wallPhotos = <Photo[]>item.photos.slice(1);

            // collect all attachments from source_id's posts
            const postProperties = {
                type: 'post',
                source_id: item.source_id
            };

            function takePhotos(attachedPhotos: string[], post: Post): string[] {
                if (post.attachments) {
                    const curPhotos = _
                        .where(post.attachments, { type: 'photo' })
                        .map( attachment => attachment.photo );

                    return attachedPhotos.concat(curPhotos);
                }
                else return attachedPhotos;
            }


            const attachedPhotos = _
                .where(items, postProperties)
                .reduce(takePhotos, []);

            //exclude attachedPhotos from wallPhotos
            wallPhotos = wallPhotos.filter( ({pid}) => !(_.findWhere(attachedPhotos, { pid })) );

            item.photos = (<(number | Photo)[]>[wallPhotos.length]).concat(wallPhotos);
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
                .where({ type: 'friend' })
                // first element contains quantity
                .map( model => (model.friends || []).slice(1) )
        ).chain().flatten().pluck('uid').value();

        // gather required profiles from source_ids
        required_uids = _(required_uids.concat(
            groupItemsColl.pluck('source_id'),
            friendItemsColl.pluck('source_id')
        )).uniq();

        profilesColl.reset(profilesColl.filter(
            model => required_uids.indexOf(model.get('id')) !== -1
        ));
    }
}

function fetchNewsfeed() {
    const code = [
        'return {newsfeed: API.newsfeed.get(', JSON.stringify(autoUpdateParams), '), time: API.utils.getServerTime()};'
    ].join('');

    function responseHandler(response: NewsfeedResp) {
        const newsfeed = response.newsfeed;

        autoUpdateParams.start_time = response.time;

        profilesColl.add(newsfeed.profiles, Profiles.addOptions);
        profilesColl.add(newsfeed.groups, Profiles.addOptions);

        discardOddWallPhotos(newsfeed.items).forEach(processRawItem);

        // try to remove old items, if new were inserted
        if (newsfeed.items.length) freeSpace();

        setTimeout(fetchNewsfeed, UPDATE_PERIOD);
    }

    function handleError(e: Error) {
        console.error("Fetch newsfeed failed... Retrying", e);
        setTimeout(fetchNewsfeed, UPDATE_PERIOD);
    }

    return Request
        .api({ code })
        .then(responseHandler)
        .catch(handleError);
}

function onLikesChanged(params: LikesChanged): void {
    let model: Item;
    const whereClause = {
        type     : params.type,
        source_id: params.owner_id,
        post_id  : params.item_id
    };

    if (params.owner_id > 0) model = friendItemsColl.findWhere(whereClause);
    else model = groupItemsColl.findWhere(whereClause);

    if (model) model.likes = params.likes;
}

/**
* Initialize all variables
*/

export default function initialize() {

    profilesColl.reset();
    groupItemsColl.reset();
    friendItemsColl.reset();

    const readyPromise = fetchNewsfeed();

// Subscribe to events from popup
    Mediator.sub(Msg.NewsfeedFriendsGet, () => readyPromise.then(publishNewsfeedFriends) );

    Mediator.sub(Msg.NewsfeedGroupsGet, () => readyPromise.then(publishNewsfeedGroups) );

    readyPromise.then( () => Mediator.sub(Msg.LikesChanged, onLikesChanged) );

    readyPromise.then( () => {
        groupItemsColl.on('change add', _.debounce(publishNewsfeedGroups, 0), 0);
        friendItemsColl.on('change add', _.debounce(publishNewsfeedFriends, 0), 0);
    });

    readyPromise.then(() => {publishNewsfeedFriends(); publishNewsfeedGroups()} );
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
