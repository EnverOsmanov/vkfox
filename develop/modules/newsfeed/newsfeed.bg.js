"use strict";
const MAX_ITEMS_COUNT = 50,
    UPDATE_PERIOD     = 10000, //ms
    _                 = require('../shim/underscore.js')._,
    Vow               = require('../shim/vow.js'),
    Backbone          = require('backbone'),
    Tracker           = require('../tracker/tracker.js'),
    Request           = require('../request/request.bg.js'),
    Mediator          = require('../mediator/mediator.js');

const profilesColl = new (Backbone.Collection.extend({
    model: Backbone.Model.extend({
        parse: function (profile) {
            if (profile.gid) profile.id = -profile.gid;
            else profile.id = profile.uid;

            return profile;
        }
    })
}))();

const ItemsColl = Backbone.Collection.extend({
    model: Backbone.Model.extend({
        parse: function (item) {
            item.id = [
                item.source_id,
                item.post_id,
                item.type
            ].join(':');
            return item;
        }
    })
}),
groupItemsColl = new ItemsColl(),
friendItemsColl = new ItemsColl();

let fetchNewsfeedDebounced,
    autoUpdateParams,
    readyPromise = Vow.promise();

fetchNewsfeedDebounced = _.debounce(fetchNewsfeed, UPDATE_PERIOD);

// entry point
Mediator.sub('auth:success', () => initialize() );

// Subscribe to events from popup
Mediator.sub('newsfeed:friends:get', () => readyPromise.then(publishNewsfeedFriends).done() );

Mediator.sub('newsfeed:groups:get', () => readyPromise.then(publishNewsfeedGroups).done() );

readyPromise.then(function () {
    Mediator.sub('likes:changed', function (params) {
        let model;
        const whereClause = {
            type: params.type,
            source_id: params.owner_id,
            post_id: params.item_id
        };

        if (params.owner_id > 0) model = friendItemsColl.findWhere(whereClause);
        else model = groupItemsColl.findWhere(whereClause);

        if (model) model.set('likes', params.likes);
    });
}).done();

readyPromise.then( () => {
    groupItemsColl.on('change add', _.debounce(publishNewsfeedGroups), 0);
    friendItemsColl.on('change add', _.debounce(publishNewsfeedFriends), 0);
}).done();

//
//
//Functions

/**
 * Generates unique id for every item,
 * or merges new item into existing one with the same id;
 * For example new wall_photos will be merged with existing for the user
 */
function processRawItem(item) {
    let propertyName, collisionItem;
    const typeToPropertyMap = {
        'wall_photo': 'photos',
        'photo': 'photos',
        'photo_tag': 'photo_tags',
        'note': 'notes',
        'friend': 'friends'
    };

    // used to eliminate duplicate items during merge
    const collection = new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            parse: function (item) {
                item.id = item.pid || item.nid || item.pid;
                return item;
            }
        })
    }))();

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

        if (collisionItem.type !== 'post') {
            // type "photo" item has "photos" property; note - notes etc
            propertyName = typeToPropertyMap[collisionItem.type];

            try {
                collection.add(item[propertyName].slice(1), {parse: true});
                collection.add(collisionItem[propertyName].slice(1), {parse: true});

                item[propertyName] = [collection.size()].concat(collection.toJSON());
            } catch (event) {
                Tracker.debug(collisionItem, item, event.stack);
            }
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
function discardOddWallPhotos(items) {
    return items.filter(function (item) {
        let wallPhotos, attachedPhotos;

        if (item.type === 'wall_photo') {
            wallPhotos = item.photos.slice(1);

            // collect all attachments from source_id's posts
            attachedPhotos = _.where(items, {
                type: 'post',
                source_id: item.source_id
            }).reduce(function (attachedPhotos, post) {
                if (post.attachments) {
                    attachedPhotos = attachedPhotos.concat(
                        _.where(post.attachments, {
                            type: 'photo'
                        }).map(function (attachment) {
                            return attachment.photo;
                        })
                    );
                }
                return attachedPhotos;
            }, []);

            //exclude attachedPhotos from wallPhotos
            wallPhotos = wallPhotos.filter(function (wallPhoto) {
                return !(_.findWhere(attachedPhotos, {
                    pid: wallPhoto.pid
                }));
            });

            item.photos = [wallPhotos.length].concat(wallPhotos);
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
    let required_uids;

    if (friendItemsColl.size() > MAX_ITEMS_COUNT || groupItemsColl.size() > MAX_ITEMS_COUNT) {
        // slice items
        friendItemsColl.reset(friendItemsColl.slice(0, MAX_ITEMS_COUNT));
        groupItemsColl.reset(groupItemsColl.slice(0, MAX_ITEMS_COUNT));

        // gather required profiles' ids from new friends
        required_uids = _(
            friendItemsColl
                .where({ type: 'friend' })
                // first element contains quantity
                .map( model => (model.get('friends') || []).slice(1) )
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
    const requestCode = [
        'return {newsfeed: API.newsfeed.get(', JSON.stringify(autoUpdateParams), '), time: API.utils.getServerTime()};'
    ].join('');

    function responseHandler(response) {
        const newsfeed = response.newsfeed;

        autoUpdateParams.start_time = response.time;

        profilesColl.add(newsfeed.profiles, {parse: true});
        profilesColl.add(newsfeed.groups, {parse: true});

        discardOddWallPhotos(newsfeed.items).forEach(processRawItem);

        // try to remove old items, if new were inserted
        if (newsfeed.items.length) freeSpace();

        fetchNewsfeedDebounced();
        readyPromise.fulfill();
    }

    Request.api({code: requestCode}).done(responseHandler);
}

/**
* Initialize all variables
*/

function initialize() {

    if (!readyPromise || readyPromise.isFulfilled()) {
        if (readyPromise) readyPromise.reject();

        readyPromise = Vow.promise();
    }
    readyPromise.then(() => {publishNewsfeedFriends(); publishNewsfeedGroups()} ).done();

    autoUpdateParams = {
        count: MAX_ITEMS_COUNT
    };
    profilesColl.reset();
    groupItemsColl.reset();
    friendItemsColl.reset();
    fetchNewsfeed();
}

function publishNewsfeedFriends() {
    Mediator.pub('newsfeed:friends', {
        profiles: profilesColl.toJSON(),
        items: friendItemsColl.toJSON()
    });
}

function publishNewsfeedGroups() {
    Mediator.pub('newsfeed:groups', {
        profiles: profilesColl.toJSON(),
        items: groupItemsColl.toJSON()
    });
}
