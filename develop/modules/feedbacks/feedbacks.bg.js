"use strict";
const _                = require('underscore')._,
    Backbone           = require('backbone'),
    Request            = require('../request/request.bg.js'),
    User               = require('../users/users.bg.js'),
    Mediator           = require('../mediator/mediator.js'),
    Router             = require('../router/router.bg.js'),
    Browser            = require('../browser/browser.bg.js'),
    I18N               = require('../i18n/i18n.js'),
    PersistentModel    = require('../persistent-model/persistent-model.js'),
    Notifications      = require('../notifications/notifications.bg.js'),
    ProfilesCollection = require('../profiles-collection/profiles-collection.bg.js');

const MAX_ITEMS_COUNT  = 50,
    MAX_COMMENTS_COUNT = 3,
    UPDATE_PERIOD      = 2000; //ms

let persistentModel, userId, fetchFeedbacksDebounced;

const autoUpdateNotificationsParams = {
    filters: 'wall,mentions,likes,reposts,followers,friends',
    count  : MAX_ITEMS_COUNT
};

const autoUpdateCommentsParams = {
    last_comments: 1,
    count        : MAX_ITEMS_COUNT
};

const profilesColl = new (ProfilesCollection.extend({
    model: Backbone.Model.extend({
        parse: function (profile) {
            if (profile.gid) profile.id = -profile.gid;
            else profile.id = profile.uid;

            return profile;
        }
    })
}))();

const FeedbacksCollection = Backbone.Collection.extend({
    comparator: model => model.get('date')
});

const itemsColl = new (Backbone.Collection.extend({
    comparator: model => -model.get('date')
}))();

/**
 * Notifies about current state of module.
 * Has a tiny debounce to make only one publish per event loop
 */
const publishData = _.debounce(function publishData() {
    function itemsCollJS() {
        return itemsColl.map(item => {
            const itemJS = item.toJSON();
            itemJS["feedbacks"] = item.get("feedbacks").toJSON();
            return itemJS
        })
    }

    Mediator.pub("feedbacks:data", {
        profiles: profilesColl.toJSON(),
        items   : itemsCollJS()
    });
}, 0);


fetchFeedbacksDebounced = _.debounce(fetchFeedbacks, UPDATE_PERIOD);


// entry point
Mediator.sub('auth:success', data => {
    userId = data.userId;
    initialize();
});


Mediator.sub('likes:changed', params => {
    const changedItemUniqueId = [ params.type, params.item_id, 'user', params.owner_id ].join(':'),
        changedModel          = itemsColl.get(changedItemUniqueId);

    if (changedModel) {
        changedModel.get('parent').likes = params.likes;
        itemsColl.trigger('change');
    }
});

Mediator.sub('feedbacks:unsubscribe', params => {
    const unsubscribeFromId = [
        params.type, params.item_id,
        'user', params.owner_id
    ].join(':');

    Request.api({
        code: `return API.newsfeed.unsubscribe(${JSON.stringify(params)});`
    }).then( (response) => {
        if (response) {
            itemsColl.remove(itemsColl.get(unsubscribeFromId));
        }
    });
});

//
//
// Functions:

/**
 * Updates "latestFeedbackId" with current last item(parentId+feedbackId)
 * Should be called on every change
 */
function updateLatestFeedbackId() {
    let identifier;
    const firstModel = itemsColl.first();

    if (firstModel) {
        identifier = firstModel.get('id');

        if (firstModel.has('feedbacks')) {
            identifier += ':' + firstModel.get('feedbacks').last().get('id');
        }
        persistentModel.set('latestFeedbackId', identifier);
    }
}

/**
 * Generates uniq id for feedback item
 *
 * @param {String} type of parent: post, comments, topic etc
 * @param {Object} parent
 *
 * @return {String}
 */
function generateItemID(type, parent) {
    if (parent.owner_id) {
        return [
            // replace wall with post,
            // to make correct merging items from 'notifications.get' and 'newsfeed.getComments'
            type === 'wall' ? 'post':type,
            parent.id || parent.pid || parent.cid || parent.post_id,
            'user', parent.owner_id
        ].join(':');
    }
    else return _.uniqueId(type);
}

/**
 * Creates feedbacks item
 *
 * @param {String} type Type of parent: post, wall, topic, photo etc
 * @param {Object} parent
 * @param {String} [itemID] pass if you already have ID
 *
 * @return {Object}
 */
function createItemModel(type, parent, itemID) {
  return new Backbone.Model({
      id    : itemID ? itemID : generateItemID(type, parent),
      parent: parent,
      type  : type
    });
}

/**
 * Processes raw comments item and adds it to itemsColl,
 * doesn't sort itemsColl
 *
 * @param {Object} item
 */
function addRawCommentsItem(item) {
    const parent = item,
      parentType = item.type;

    let itemModel, lastCommentDate;

    function comment2Feedback(feedback) {
        feedback.owner_id = Number(feedback.from_id);
        return {
            id      : generateItemID('comment', feedback),
            type    : 'comment',
            feedback: feedback,
            date    : feedback.date
        };
    }

    // do nothing if no comments
    if (item.comments.list && item.comments.list.length) {

        parent.owner_id = Number(parent.from_id || parent.source_id);

        const itemID = generateItemID(parentType, parent);

        if (!(itemModel = itemsColl.get(itemID))) {
            itemModel = createItemModel(parentType, parent);
            itemsColl.add(itemModel, {sort: false});
        }

        if (!itemModel.has('feedbacks')) {
            itemModel.set('feedbacks', new FeedbacksCollection());
        }

        itemModel
            .get('feedbacks')
            .add(
                item.comments
                    .list.slice(-MAX_COMMENTS_COUNT)
                    .map(comment2Feedback)
            );

        lastCommentDate = itemModel.get('feedbacks').last().get('date');
        if (!itemModel.has('date') || itemModel.get('date') < lastCommentDate) {
            itemModel.set('date', lastCommentDate);
        }

        itemModel.trigger('change');
    }
}

/**
 * Returns true for supported feedback types
 * @param {String} type
 *
 * @returns {Boolean}
 */
function isSupportedType(type) {
    const forbidden = [
      'mention_comments',
      'reply_comment',
      'reply_comment_photo',
      'reply_comment_video',
      'reply_topic'
    ];

    return forbidden.indexOf(type) === -1;
}

/**
 * Handles news' item.
 * If parent is already in collection,
 * then adds feedback to parent's feedbacks collection.
 * Doesn't sort itemsColl
 *
 * @param {Object} item
 */
function addRawNotificationsItem(item) {
    const { feedback } = item;

    let parentType, feedbackType,
        { parent } = item;

    if (!isSupportedType(item.type)) return;

    if (item.type === 'friend_accepted') {
        parentType = item.type;
        parent     = feedback;
    }
    else if (item.type.indexOf('_') !== -1) {
        const typeTokens = item.type.split('_');

        feedbackType = typeTokens[0];
        parentType   = typeTokens[1];
    } if (item.type === "mention") {
        feedbackType = item.type;
        parentType   = item.type;
        parent       = feedback;
    }
    else parentType = item.type;

    if (feedbackType) {

        parent.owner_id = Number(parent.from_id || parent.owner_id);
        const itemID = generateItemID(parentType, parent);

        let itemModel;
        if (!(itemModel = itemsColl.get(itemID))) {
            itemModel = createItemModel(parentType, parent, itemID);
            itemsColl.add(itemModel, {sort: false});
        }

        if (!itemModel.has('feedbacks')) itemModel.set('feedbacks', new FeedbacksCollection());

        itemModel
            .get('feedbacks')
            .add([].concat(feedback).map(feedback => {
                let id;

                feedback.owner_id = Number(feedback.from_id || feedback.owner_id);

                if (feedbackType === 'like' || feedbackType === 'copy') {
                    // 'like' and 'post', so we need to pass 'parent'
                    // to make difference for two likes from the same user to different objects
                    id = generateItemID(feedbackType, parent);
                }
                else id = generateItemID(feedbackType, feedback);

                return {
                    id      : id,
                    type    : feedbackType,
                    feedback: feedback,
                    date    : item.date
                };
            }));

        if (!itemModel.has('date') || itemModel.get('date') < item.date) itemModel.set('date', item.date);

        itemModel.trigger('change');
    }
    else {
        //follows and friend_accepter types are array
        [].concat(feedback).forEach(function (feedback) {

            feedback.owner_id = Number(feedback.owner_id || feedback.from_id);

            const itemModel = createItemModel(parentType, feedback);

            itemModel.set('date', item.date);
            itemsColl.add(itemModel, {sort: false});
        });
    }
}

function fetchFeedbacks() {
    const requestCode = [
        'return {time: API.utils.getServerTime(),',
        ' notifications: API.notifications.get(', JSON.stringify(autoUpdateNotificationsParams), '),',
        ' comments: API.newsfeed.getComments(', JSON.stringify(autoUpdateCommentsParams), ')',
        '};'
    ].join('');

    function feedbackHandler(response) {
        const { notifications, comments } = response;

        autoUpdateNotificationsParams.start_time = autoUpdateCommentsParams.start_time = response.time;

        // first item in notifications contains quantity
        if (
            (notifications.items && notifications.items.length > 1) ||
            (comments.items && comments.items.length)
        ) {
            profilesColl.add(comments.profiles, {parse: true});
            profilesColl.add(comments.groups, {parse: true});
            profilesColl.add(notifications.profiles, {parse: true});
            profilesColl.add(notifications.groups, {parse: true});

            notifications.items.slice(1).forEach(addRawNotificationsItem);
            comments.items.forEach(addRawCommentsItem);
            itemsColl.sort();
        }
        fetchFeedbacksDebounced();
    }

    return Request
        .api({code: requestCode})
        .then(feedbackHandler)
        .catch(e => console.error("Unsuccessful fetchFeedbacks", e));
}


function tryNotification() {
    const itemModel = itemsColl.first();

    let notificationItem, type, parentType;

    // don't notify on first run,
    // when there is no previous value
    if (!this._previousAttributes.hasOwnProperty('latestFeedbackId')) return;

    if (itemModel.has('feedbacks')) {
        // notification has parent, e.g. comment to post, like to video etc
        const lastFeedback = itemModel.get('feedbacks').last();

        notificationItem = lastFeedback.get('feedback');
        type             = lastFeedback.get('type');
        parentType       = itemModel.get('type');
    }
    else {
        // notification is parent itself, e.g. wall post, friend request etc
        notificationItem = itemModel.get('parent');
        type             = itemModel.get('type');
    }

    const ownerId = notificationItem.owner_id;
    let profile, gender, title, message, name;

    function makeTitle(i18nText) { return `${name} ${i18nText}` }

    // Don't show self messages
    if (ownerId !== userId) {
        try {
            profile = profilesColl.get(ownerId).toJSON();
            name = User.getName(profile);
            gender = profile.sex === 1 ? 'female':'male';
        } catch (e) {
            console.log(ownerId, profile, name);
            throw e;
        }

        switch (type) {
            case 'friend_accepted':
                title = makeTitle(I18N.get('friend request accepted', { GENDER: gender }));
                break;
            case 'follow':
                title = makeTitle(I18N.get('started following you', { GENDER: gender }));
                break;
            case 'mention':
                title = makeTitle(I18N.get('mentioned you', { GENDER: gender }));
                message = notificationItem.text;
                break;
            case 'wall':
                title = makeTitle(I18N.get('posted on your wall', { GENDER: gender }));
                message = notificationItem.text;
                break;
            case 'like':
                title = makeTitle(I18N.get('liked your ' + parentType, { GENDER: gender }));
                break;
            case 'copy':
                title = makeTitle(I18N.get('shared your ' + parentType, { GENDER: gender }));
                break;
            case 'comment':
                // 'mention_commentS' type in notifications
            case 'comments':
            case 'reply':
                title = makeTitle( I18N.get('left a comment', { NAME: name, GENDER: gender }) );
                message = notificationItem.text;
                break;
            default:
                break;
        }

        if (title) {
            // Don't notify, when active tab is vk.com
            Browser.isVKSiteActive().then(function (active) {
                const feedbacksActive = Browser.isPopupOpened() && Router.isFeedbackTabActive();

                if (!active) {
                    Notifications.notify({
                        type   : Notifications.NEWS,
                        title  : title,
                        message: message,
                        image  : profile.photo,
                        noBadge: feedbacksActive,
                        noPopup: feedbacksActive
                    });
                }
            });
        }
    }
}

/**
 * Initialize all variables
 */
function initialize() {
    const readyPromise = fetchFeedbacks();

    readyPromise.then( () => {
        persistentModel = new PersistentModel({}, {
            name: ['feedbacks', 'background', userId].join(':')
        });
        persistentModel.on("change:latestFeedbackId", tryNotification);

        updateLatestFeedbackId();
        publishData();
    });

    readyPromise.then( () => {
        itemsColl.on('add change remove', _.debounce( () => {
            itemsColl.sort();
            updateLatestFeedbackId();
            publishData();
        }));
        profilesColl.on('change', publishData);
    });

    Mediator.sub('feedbacks:data:get', () => readyPromise.then(publishData) );

    itemsColl.reset();
    profilesColl.reset();
}

