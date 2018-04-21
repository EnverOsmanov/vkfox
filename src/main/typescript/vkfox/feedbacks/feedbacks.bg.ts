"use strict";
import Request from '../request/request.bg'
import * as _ from "underscore"
import User from "../back/users/users.bg"
import Mediator from "../mediator/mediator.bg"
import Router from "../back/router/router.bg"
import Browser from "../browser/browser.bg"
import I18N from "../i18n/i18n"
import PersistentModel from "../persistent-model/persistent-model"
import Notifications from "../notifications/notifications.bg"
import {Profiles, ProfilesCmpn} from "../profiles-collection/profiles-collection.bg";
import {Item, ItemColl} from "./collections/ItemColl";
import {NotifType} from "../notifications/Notification";
import {FeedbacksCollection
} from "./collections/FeedBacksCollection";
import Msg from "../mediator/messages";
import {LikesChanged} from "../newsfeed/types";
import {AccessTokenError} from "../request/models";
import {AuthModelI} from "../auth/types";
import {
    CommentsNews,
    CommentsNewsItem,
    FeedbackObj,
    FeedbackRS,
    NotificationObj, ReplyCommentNotification, ReplyFeedback,
    WallPostMentionFeedback
} from "./types";
import {NewsfeedGetCommentsRequest, NotificationsRequest} from "../../vk/types";
import {FeedbackUnsubOptions} from "../popup/news/types";

/**
 * Responsible for "News -> My" page
 *
 */



const MAX_ITEMS_COUNT  = 50,
    MAX_COMMENTS_COUNT = 3,
    UPDATE_PERIOD      = 3000; //ms

let persistentModel, userId;

const itemsColl = new ItemColl();
const profilesColl = new Profiles();


const autoUpdateNotificationsParams: NotificationsRequest = {
    filters: 'wall,mentions,likes,reposts,followers,friends',
    count  : MAX_ITEMS_COUNT
};

const autoUpdateCommentsParams: NewsfeedGetCommentsRequest = {
    last_comments_count: 1,
    count        : MAX_ITEMS_COUNT
};


/**
 * Notifies about current state of module.
 * Has a tiny debounce to make only one publish per event loop
 */
function publishData() {
    function itemsCollJS() {
        return itemsColl.map(item => {
            const itemJS = item.toJSON();
            if (item.feedbacks) itemJS["feedbacks"] = item.feedbacks.toJSON();

            return itemJS
        })
    }

    Mediator.pub(Msg.FeedbacksData, {
        profiles: profilesColl.toJSON(),
        items   : itemsCollJS()
    });
}


function fetchFeedbacksDebounced() {
    setTimeout(fetchFeedbacks, UPDATE_PERIOD);
}


//
//
// Functions:

function onChangeUser(data: AuthModelI): void {
    userId = data.userId;
    itemsColl.reset();
    profilesColl.reset();

    persistentModel = new PersistentModel({}, {
        name: ['feedbacks', 'background', userId].join(':')
    });
    persistentModel.on("change:latestFeedbackId", tryNotification);
}

export default function init() {

    const readyPromise = fetchFeedbacks();
    // entry point
    initialize(readyPromise);

    Mediator.sub(Msg.AuthUser, onChangeUser);

    Mediator.sub(Msg.LikesChanged, onLikesChanged);

    Mediator.sub(Msg.FeedbacksUnsubscribe, onFeedbackUnsubcribe);
}

function onLikesChanged(params: LikesChanged) {

    const changedItemUniqueId = [ params.type, params.item_id, 'user', params.owner_id ].join(':'),
        changedModel          = itemsColl.get(changedItemUniqueId);

    if (changedModel) {
        changedModel.parent.likes = params.likes;
        itemsColl.trigger('change');
    }
}


function onFeedbackUnsubcribe(params: FeedbackUnsubOptions) {
    const unsubscribeFromId = [
        params.type, params.item_id,
        'user', params.owner_id
    ].join(':');

    Request.api<number>({
        code: `return API.newsfeed.unsubscribe(${JSON.stringify(params)});`
    }).then( (response) => {
        if (response) {
            itemsColl.remove(itemsColl.get(unsubscribeFromId));
        }
    });
}


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
            identifier += ':' + firstModel.feedbacks.last().id;
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
function generateItemID(type: string, parent): string {
    if (type == "photo") {
        debugger;
    }

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


function getOrCreateFeedbackItem(parentType: string, parent: FeedbackObj): Item {
    const itemID = generateItemID(parentType, parent);
    const itemModel = itemsColl.get(itemID);

    if (itemModel) return itemModel;
    else {
        const newItemModel = createItemModel(parentType, parent);
        itemsColl.add(newItemModel, ItemColl.addOptions);
        return newItemModel
    }
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
function createItemModel(type: string, parent: FeedbackObj, itemID?: string): Item {
    const id = itemID ? itemID : generateItemID(type, parent);

    return new Item({parent, type, id});
}

/**
 * Processes raw comments from newsItem and adds it to itemsColl,
 * doesn't sort itemsColl
 *
 * @param {Object} newsItem
 */
function addRawCommentsItem(newsItem: CommentsNewsItem) {
    const parent = newsItem,
      parentType = newsItem.type;

    let lastCommentDate: number;

    function comment2Feedback(feedback: FeedbackObj) {
        feedback.owner_id = Number(feedback.from_id);
        return {
            id      : generateItemID('comment', feedback),
            type    : 'comment',
            feedback: feedback,
            date    : feedback.date
        };
    }

    // do nothing if no comments
    if (newsItem.comments.list && newsItem.comments.list.length) {

        parent.owner_id = Number(parent.from_id || parent.source_id);

        const fbItemModel = getOrCreateFeedbackItem(parentType, parent);

        if (!fbItemModel.has('feedbacks')) {
            fbItemModel.feedbacks = new FeedbacksCollection();
        }

        fbItemModel.feedbacks
            .add(
                newsItem.comments.list
                    .slice(-MAX_COMMENTS_COUNT)
                    .map(comment2Feedback)
            );

        lastCommentDate = fbItemModel.feedbacks.last().date;
        if (!fbItemModel.has('date') || fbItemModel.date < lastCommentDate) {
            fbItemModel.date = lastCommentDate;
        }

        fbItemModel.trigger('change');
    }
}

/**
 * Returns true for supported feedback types
 * @param {String} type
 *
 * @returns {Boolean}
 */
function isSupportedType(type: string): boolean {
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
function addRawNotificationsItem(item: NotificationObj): void {
    const { feedback } = item;

    let parentType: string,
        feedbackType: string,
        parent: FeedbackObj;

    if (!isSupportedType(item.type)) return;

    if (item.type === "friend_accepted") {
        parentType = item.type;
    }
    else if (item.type.indexOf("_") !== -1) {
        const typeTokens = item.type.split("_");

        feedbackType = typeTokens[0];
        parentType   = typeTokens[1];
    }

    if (item.type === "mention" || item.type == "wall_publish") {
        feedbackType = item.type;
        parentType   = item.type;
        parent       = <FeedbackObj>feedback;
    }
    else {
        if ("parent" in item) {
            debugger;
            parent = (item as ReplyCommentNotification).parent;
        }
        parentType = item.type;
    }

    if (feedbackType) {
        parent.owner_id = Number(parent.from_id || parent.owner_id);
        const itemID = generateItemID(parentType, parent);

        let itemModel: Item;

        if (!(itemModel = itemsColl.get(itemID))) {
            itemModel = createItemModel(parentType, parent, itemID);
            itemsColl.add(itemModel, ItemColl.addOptions);
        }

        if (!itemModel.has('feedbacks')) itemModel.feedbacks = new FeedbacksCollection();

        itemModel.feedbacks
            .add([].concat(feedback).map( (feedback: FeedbackObj) => {
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

        if (!itemModel.has('date') || itemModel.date < item.date) itemModel.date = item.date;

        itemModel.trigger('change');
    }
    else {
        //follows and friend_accepter types are array
        [].concat(feedback).forEach( (feedback: FeedbackObj) => {

            feedback.owner_id = Number(feedback.owner_id || feedback.from_id);

            const itemModel = createItemModel(parentType, feedback);

            itemModel.date = item.date;
            itemsColl.add(itemModel, ItemColl.addOptions);
        });
    }
}

function fetchFeedbacks(): Promise<void> {
    const code = [
        'return {time: API.utils.getServerTime(),',
        ' notifications: API.notifications.get(', JSON.stringify(autoUpdateNotificationsParams), '),',
        ' comments: API.newsfeed.getComments(', JSON.stringify(autoUpdateCommentsParams), ')',
        '};'
    ].join('');

    function feedbackHandler(response: FeedbackRS) {
        const { notifications } = response;
        let newsAboutComments: CommentsNews;

        if (response.comments === false) console.debug("CommentsNews", response.comments);
        else {
            newsAboutComments = <CommentsNews>response.comments
        }

        autoUpdateNotificationsParams.start_time = autoUpdateCommentsParams.start_time = response.time;

        // first item in notifications contains quantity
        if (
            (notifications.items && notifications.items.length > 1) ||
            (newsAboutComments.items && newsAboutComments.items.length)
        ) {
            profilesColl.add(newsAboutComments.profiles, ProfilesCmpn.addOptions);
            profilesColl.add(newsAboutComments.groups, ProfilesCmpn.addOptions);
            profilesColl.add(notifications.profiles, ProfilesCmpn.addOptions);
            profilesColl.add(notifications.groups, ProfilesCmpn.addOptions);

            notifications.items.forEach(addRawNotificationsItem);
            newsAboutComments.items.forEach(addRawCommentsItem);
            itemsColl.sort();
        }
    }

    function handleError(e: Error) {
        if (e instanceof AccessTokenError) {
            console.error("Unsuccessful fetchFeedbacks... Retrying", e.message)
        }
        else console.error("Unsuccessful fetchFeedbacks... Retrying", e)
    }

    return Request
        .api<FeedbackRS>({ code })
        .then(feedbackHandler)
        .catch(handleError)
        .then(fetchFeedbacksDebounced);
}


function tryNotification() {
    const itemModel = itemsColl.first();

    let notificationItem: FeedbackObj,
        type: string,
        parentType: string;

    // don't notify on first run,
    // when there is no previous value
    if (!this._previousAttributes.hasOwnProperty('latestFeedbackId')) return;

    if (itemModel.has('feedbacks')) {
        // notification has parent, e.g. comment to post, like to video etc
        const lastFeedback = itemModel.feedbacks.last();

        notificationItem = lastFeedback.feedback;
        type             = lastFeedback.type;
        parentType       = itemModel.type;
    }
    else {
        // notification is parent itself, e.g. wall post, friend request etc
        notificationItem = itemModel.parent;
        type             = itemModel.type;
    }

    const ownerId = notificationItem.owner_id;
    let title: string,
        message: string;


    // Don't show self messages
    if (ownerId !== userId) {
        const profile = profilesColl.get(ownerId).toJSON();
        const name = User.getName(profile);
        const gender = profile.sex === 1 ? "female" : "male";


        switch (type) {
            case 'friend_accepted':
                title = makeTitle(I18N.get('friend request accepted', { GENDER: gender }));
                break;
            case 'follow':
                title = makeTitle(I18N.get('started following you', { GENDER: gender }));
                break;
            case 'mention':
                title = makeTitle(I18N.get('mentioned you', { GENDER: gender }));
                message = (<WallPostMentionFeedback>notificationItem).text;
                break;
            case 'wall':
                title = makeTitle(I18N.get('posted on your wall', { GENDER: gender }));
                message = (<WallPostMentionFeedback>notificationItem).text;
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
                title = I18N.get('left a comment', { NAME: name, GENDER: gender });
                message = (<ReplyFeedback>notificationItem).text;
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
                        type   : NotifType.NEWS,
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

    function makeTitle(i18nText) { return `${name} ${i18nText}` }
}

/**
 * Initialize all variables
 */
function initialize(readyPromise: Promise<void>) {

    readyPromise.then( () => {
        itemsColl.on('add change remove', _.debounce( () => {
            itemsColl.sort();
            updateLatestFeedbackId();
            publishData();
        }, 1));
        profilesColl.on('change', publishData);

        updateLatestFeedbackId();
        publishData();
    });

    Mediator.sub(Msg.FeedbacksDataGet, () => readyPromise.then(publishData) );
}

