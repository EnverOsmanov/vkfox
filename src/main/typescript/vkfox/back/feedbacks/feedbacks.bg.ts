"use strict";
import Request from '../../request/request.bg'
import * as _ from "underscore"
import User from "../users/users.bg"
import Mediator from "../../mediator/mediator.bg"
import Router from "../router/router.bg"
import Browser from "../../browser/browser.bg"
import I18N from "../../i18n/i18n"
import PersistentModel from "../../persistent-model/persistent-model"
import Notifications from "../../notifications/notifications.bg"
import {Profiles, ProfilesCmpn} from "../../profiles-collection/profiles-collection.bg";
import {Item, ItemColl} from "../../feedbacks/collections/ItemColl";
import {NotifType} from "../../notifications/Notification";
import {FeedbacksCollection} from "../../feedbacks/collections/FeedBacksCollection";
import Msg from "../../mediator/messages";
import {LikesChanged} from "../../newsfeed/types";
import {AccessTokenError} from "../../request/models";
import {AuthModelI} from "../auth/types";
import {
    FeedbackObj,
    FeedbackObjShort, FeedbackObjShortComment, FeedbackWithOwnerId,
    FoxCommentsNewsItem, ParentObj, ParentObjPost,
    ParentWithOwnerId,
    ReplyFeedback, TopicFeedbackFromComm,
    WallMentionFeedback
} from "../../feedbacks/types";
import {NewsfeedGetCommentsRequest, NotificationsRequest} from "../../../vk/types";
import {FeedbackItemObj, FeedbackUnsubOptions} from "../../popup/news/types";
import {
    CommentsNews,
    CommentsNewsItem,
    FeedbackRS,
    FeedbackTypes,
    FollowNoti,
    FriendAcceptedNoti,
    LikePostNoti,
    LikeCommentNoti,
    MentionNoti,
    NotificationObj,
    ParentTypes,
    PhotoCommentN,
    PostCommentN,
    WallPublishNoti,
    WithLikes,
    ParentComment,
    PorFPostItem,
    LikeCommentPhotoNoti,
    LikeCommentVideoNoti,
    LikeCommentTopicNoti,
    CommentPhotoNoti,
    MentionCommentPhotoNoti,
    WithFromId,
    CommentVideoNoti,
    FeedbackComment,
    CommentFromNews
} from "../../../vk/types/feedback";
import {PhotoItem, VideoItem} from "../../../vk/types/newsfeed";

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
        (changedModel.parent as ParentObjPost | TopicFeedbackFromComm).likes = params.likes;
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

    if (parent.owner_id) {

        // replace wall with post,
        // to make correct merging items from 'notifications.get' and 'newsfeed.getComments'
        const f = type === 'wall'
            ? 'post'
            :type;

        const s = ("id" in parent)
            ? (parent as ParentComment).id
            : parent.post_id;

        return `${f}:${s}:user:${parent.owner_id}`;
    }
    else return _.uniqueId(type);
}

function generateFeedbackID(type: string, p: PhotoItem | VideoItem | ParentComment, feedback: FeedbackWithOwnerId): string {

    if (feedback.owner_id) {

        // replace wall with post,
        // to make correct merging items from 'notifications.get' and 'newsfeed.getComments'
        const f = type === 'wall'
            ? 'post'
            :type;

        const s = p.id;

        return `${f}:${s}:user:${feedback.owner_id}`;
    }
    else return _.uniqueId(type);
}


function getOrCreateFeedbackItem(parentType: string, parent: FoxCommentsNewsItem): Item {
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
function createItemModel(type: string, parent: ParentObj, itemID?: string): Item {
    const id = itemID ? itemID : generateItemID(type, parent);
    const feedbacks: any = new FeedbacksCollection();

    const item: FeedbackItemObj = {parent, type, id, feedbacks};

    return new Item(item);
}

/**
 * Processes raw comments from newsItem and adds it to itemsColl,
 * doesn't sort itemsColl
 *
 * @param {Object} newsItem
 */
function addRawCommentsItem(newsItem: CommentsNewsItem) {
    const parentType = newsItem.type;

    let lastCommentDate: number;

    function comment2Feedback(comment: CommentFromNews): FeedbackObj {
        const feedback: FeedbackObjShortComment = {
            ...comment,
            owner_id: comment.from_id
        };

        return {
            id      : generateItemID("comment", feedback),
            type    : "comment",
            date    : comment.date,
            feedback
        };
    }

    // do nothing if no comments
    if (newsItem.comments.list && newsItem.comments.list.length) {
        const owner_id = ("from_id" in newsItem)
            ? (newsItem as PostCommentN).from_id
            : newsItem.source_id;

        const parent: FoxCommentsNewsItem = {
            ...newsItem,
            owner_id
        };

        const fbItemModel = getOrCreateFeedbackItem(parentType, parent);

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


function createItemModelIfNotExist(parentType, p: ParentWithOwnerId): Item {
    const itemID = generateItemID(parentType, p);

    let itemModel: Item;

    if (!(itemModel = itemsColl.get(itemID))) {
        itemModel = createItemModel(parentType, p, itemID);
        itemsColl.add(itemModel, ItemColl.addOptions);
    }

    return itemModel
}

function createFeedbackWithFromId(type: string, date: number, f: FeedbackComment | WithFromId, p: PhotoItem | VideoItem | ParentComment) {
    const fWithOwnerId = {
        ...f,
        owner_id: f.from_id
    };

    const id = generateFeedbackID(type, p, fWithOwnerId);

    return {
        id,
        type,
        feedback: fWithOwnerId,
        date
    };
}

function createItemWithOwnerId(type: string, date: number, f: PorFPostItem | WithFromId): Item {
    const fWithOwnerId = {
        ...f,
        owner_id: f.from_id
    };

    const itemModel = createItemModel(type, fWithOwnerId);
    itemModel.date = date;

    return itemModel;
}

/**
 * Handles news' item.
 * If parent is already in collection,
 * then adds feedback to parent's feedbacks collection.
 * Doesn't sort itemsColl
 *
 * @param {Object} item
 */
function addRawNotificationsItemV2(item: NotificationObj): void {
    switch (item.type) {
        case "mention_comments":
        case "reply_comment":
        case "reply_comment_photo":
        case "reply_comment_video":
        case "reply_topic":
            return;

        case "follow":
        case "friend_accepted":
            const noti = item as FollowNoti | FriendAcceptedNoti;

            noti.feedback.items.forEach( f => {

                const itemModel = createItemWithOwnerId(item.type, item.date, f);

                itemsColl.add(itemModel, ItemColl.addOptions)
            });
            break;

        case "mention": {
            const mN = item as MentionNoti;

            const itemModel = createItemWithOwnerId(item.type, item.date, mN.feedback);

            itemsColl.add(itemModel, ItemColl.addOptions);
            break;
        }

        case "like_comment":
        case "like_comment_photo":
        case "like_comment_video":
        case "like_comment_topic": {
            const lcN = item as LikeCommentNoti | LikeCommentPhotoNoti | LikeCommentVideoNoti | LikeCommentTopicNoti;

            const typeTokens = item.type.split("_");

            const feedbackType = typeTokens[0];
            const parentType = typeTokens[1];
            const p = lcN.parent;

            const itemModel = createItemModelIfNotExist(parentType, p);

            const feedbacks = lcN.feedback.items
                .map(f => createFeedbackWithFromId(feedbackType, item.date, f, p));

            itemModel.feedbacks
                .add(feedbacks);

            if (!itemModel.has('date') || itemModel.date < item.date) itemModel.date = item.date;

            itemModel.trigger('change');
            return;
        }

        case "comment_photo":
        case "mention_comment_photo":
        case "comment_video":
        case "mention_comment_video": {
            const noti = item as
                CommentPhotoNoti | MentionCommentPhotoNoti
                | CommentVideoNoti | MentionCommentPhotoNoti;

            const typeTokens = item.type
                .replace("mention_", "")
                .split("_");

            const feedbackType = typeTokens[0];
            const parentType = typeTokens[1];
            const p = noti.parent;

            const itemModel = createItemModelIfNotExist(parentType, p);

            const f = noti.feedback;

            const feedbacks = createFeedbackWithFromId(feedbackType, item.date, f, p);

            itemModel.feedbacks
                .add(feedbacks);

            if (!itemModel.has('date') || itemModel.date < item.date) itemModel.date = item.date;

            itemModel.trigger('change');

            break;
        }

/*        case "like_post": {

            break;
        }*/

        default:
            console.warn("Unknown notification type", item.type)
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

        if (
            (notifications.items && notifications.items.length) ||
            (newsAboutComments.items && newsAboutComments.items.length)
        ) {
            profilesColl.add(newsAboutComments.profiles, ProfilesCmpn.addOptions);
            profilesColl.add(newsAboutComments.groups, ProfilesCmpn.addOptions);
            profilesColl.add(notifications.profiles, ProfilesCmpn.addOptions);
            profilesColl.add(notifications.groups, ProfilesCmpn.addOptions);

            notifications.items.forEach(addRawNotificationsItemV2);
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

    let notificationItem: ParentObj | FeedbackObjShort,
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
        const profile = profilesColl.get(Math.abs(ownerId)).toJSON();
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
                message = (<WallMentionFeedback>notificationItem).text;
                break;
            case 'wall':
                title = makeTitle(I18N.get('posted on your wall', { GENDER: gender }));
                message = (<WallMentionFeedback>notificationItem).text;
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

