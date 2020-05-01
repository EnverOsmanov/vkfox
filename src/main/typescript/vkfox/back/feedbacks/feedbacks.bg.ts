"use strict";
import RequestBg from '../request/request.bg'
import * as _ from "underscore"
import User from "../users/users.bg"
import Mediator from "../../mediator/mediator.bg"
import Router from "../router/router.bg"
import Browser from "../browser/browser.bg"
import I18N from "../../common/i18n/i18n"
import PersistentModel from "../../common/persistent-model/persistent-model"
import VKfoxNotifications from "../notifications/notifications.bg"
import {FeedItem, ItemColl} from "../../common/feedbacks/collections/ItemColl";
import {NotifType} from "../notifications/VKNotification";
import {FeedbacksCollection} from "../../common/feedbacks/collections/FeedBacksCollection";
import {Msg} from "../../mediator/messages";
import {LikesChanged} from "../newsfeed/types";
import {AccessTokenError} from "../request/models";
import {AuthModelI} from "../auth/types";
import {
    CommentsNewsItemPar,
    FeedbackObj,
    FeedbackObjShort,
    FeedbackObjShortComment,
    FeedbackWithOwnerId,
    FWithFromIdAndOwnerId,
    ParentObj,
    ParentObjPost,
    ParentWithOwnerId,
    PostWithOwnerId,
    ReplyFeedback,
    WallMentionFeedback
} from "../../common/feedbacks/types";
import {NewsfeedGetCommentsRequest, NotificationsRequest} from "../../../vk/types";
import {FeedbackItemObj, FeedbackUnsubOptions} from "../../ui/popup/news/types";
import {
    CommentFromNews,
    CommentPhotoNoti,
    CommentsNews,
    CommentsNewsItem,
    CommentVideoNoti,
    FeedbackComment,
    FeedbackRS,
    FollowNoti,
    FriendAcceptedNoti,
    LikeCommentNoti,
    LikeCommentPhotoNoti,
    LikeCommentTopicNoti,
    LikeCommentVideoNoti,
    MentionCommentPhotoNoti, MentionCommentVideoNoti,
    MentionNoti,
    NotificationObj,
    ParentComment,
    PorFPostItem,
    PostCommentN,
    WithFromId
} from "../../../vk/types/feedback";
import {ItemObj, PhotoItem, VideoItem} from "../../../vk/types/newsfeed";
import {GroupProfile, UserProfile} from "../../common/users/types";
import {GProfileCollCmpn} from "../../common/profiles-collection/profiles-collection.bg";
import {idMaker} from "../../common/feedbacks/id";

/**
 * Responsible for "News -> My" page
 *
 */



const MAX_ITEMS_COUNT  = 50,
    MAX_COMMENTS_COUNT = 3,
    UPDATE_PERIOD      = 3000; //ms

let persistentModel: PersistentModel,
    userId: number;

const itemsColl = new ItemColl();
const profilesColl: Map<number, UserProfile| GroupProfile> = new Map();


const autoUpdateNotificationsParams: NotificationsRequest = {
    filters: 'wall,mentions,likes,reposts,followers,friends',
    count  : MAX_ITEMS_COUNT
};

const autoUpdateCommentsParams: NewsfeedGetCommentsRequest = {
    last_comments_count: 10,
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
        profiles: profilesColl,
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
    profilesColl.clear();

    persistentModel = new PersistentModel({}, {
        name: `feedbacks:background:${userId}`
    });
}

export default function init() {
    GProfileCollCmpn.subscribeForLpUpdates(profilesColl as Map<number, UserProfile>);
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
        (changedModel.parent as ParentObjPost | CommentsNewsItemPar).likes = params.likes;
        itemsColl.trigger('change');
    }
}

function handleError(e: Error) {
    console.warn("Couldn't unsubscribe", e)
}


function onFeedbackUnsubcribe(params: FeedbackUnsubOptions): void {
    const unsubscribeFromId = [
        params.type,
        params.item_id,
        "user",
        params.owner_id
    ].join(':');

    const code = `return API.newsfeed.unsubscribe(${JSON.stringify(params)});`;

    function handleResponse(response) {
        if (response) {
            itemsColl.remove(itemsColl.get(unsubscribeFromId));
            updateLatestFeedbackId(true);
            publishData();
        }
    }

    RequestBg
        .api<number>({ code })
        .then(handleResponse)
        .catch(handleError);
}


/**
 * Updates "latestFeedbackId" with current last item(parentId+feedbackId)
 * Should be called on every change
 */
function updateLatestFeedbackId(silent: boolean = false) {
    let identifier;
    const firstModel = itemsColl.first();

    if (firstModel) {
        identifier = firstModel.get('id');

        if (firstModel.has('feedbacks')) {
            identifier += ':' + firstModel.feedbacks.last().id;
        }
        const oldLatestFeedbackId = persistentModel.get("latestFeedbackId");
        persistentModel.set("latestFeedbackId", identifier);

        if (oldLatestFeedbackId && oldLatestFeedbackId != identifier && !silent) {
            tryNotification()
        }
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
        const f = type === "wall"
            ? "post"
            : type;

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
        const f = type === "wall"
            ? "post"
            : type;

        const s = idMaker(p as ItemObj);

        return `${f}:${s}:user:${feedback.owner_id}`;
    }
    else return _.uniqueId(type);
}

function generateFeedbackItemID(type: string, parent: CommentsNewsItemPar): string {

    if (parent.owner_id) {

        // replace wall with post,
        // to make correct merging items from 'notifications.get' and 'newsfeed.getComments'
        const f = type === "wall"
            ? "post"
            : type;

        const s = parent.post_id;

        const wallOwnerId = parent.source_id;

        return `${f}:${s}:user:${wallOwnerId}`;
    }
    else return _.uniqueId(type);
}


function createItemModelIfNotExistComm(parentType: string, parent: CommentsNewsItemPar, date: number): FeedItem {
    const itemID = generateFeedbackItemID(parentType, parent);
    const itemModel = itemsColl.get(itemID);

    if (itemModel) return itemModel;
    else {
        const newItemModel = createItemModel(parentType, parent, itemID, date);
        itemsColl.add(newItemModel, ItemColl.addOptions);
        return newItemModel;
    }
}

/**
 * Creates feedbacks item
 *
 *
 * @return {Object}
 */
function createItemModel(type: string, parent: ParentObj, id: string, date: number): FeedItem {
    // converted to `FeedbackObj` when sending to front end
    const feedbacks: any = new FeedbacksCollection();

    const item: FeedbackItemObj = {parent, type, id, feedbacks, date};

    return new FeedItem(item);
}

function createItemModelWithNewId(type: string, parent: PostWithOwnerId | FWithFromIdAndOwnerId, date: number): FeedItem {
    const itemID = generateItemID(type, parent);

    return createItemModel(type, parent, itemID, date)
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

        const type = "comment";

        return {
            id      : generateItemID(type, feedback),
            type,
            date    : comment.date,
            feedback
        };
    }

    // do nothing if no comments
    if (newsItem.comments.list && newsItem.comments.list.length) {
        const owner_id = ("from_id" in newsItem)
            ? (newsItem as PostCommentN).from_id
            : newsItem.source_id;

        const parent: CommentsNewsItemPar = {
            ...newsItem,
            owner_id
        };

        const limitedComments = newsItem.comments.list.slice(-MAX_COMMENTS_COUNT);

        lastCommentDate = limitedComments[limitedComments.length - 1].date;

        const fbItemModel = createItemModelIfNotExistComm(parentType, parent, lastCommentDate);

        fbItemModel.feedbacks
            .add(limitedComments.map(comment2Feedback));

        lastCommentDate = fbItemModel.feedbacks.last().date;
        if (!fbItemModel.has('date') || fbItemModel.date < lastCommentDate) {
            fbItemModel.date = lastCommentDate;
        }

        fbItemModel.trigger('change');
    }
}


function createItemModelIfNotExistFeed(parentType: string, p: ParentWithOwnerId, date: number): FeedItem {
    const itemID = generateItemID(parentType, p);
    const itemModel = itemsColl.get(itemID);

    if (itemModel) return itemModel;
    else {
        const newItemModel = createItemModel(parentType, p, itemID, date);
        itemsColl.add(newItemModel, ItemColl.addOptions);
        return newItemModel;
    }
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

function createItemWithOwnerId(type: string, date: number, f: PorFPostItem | WithFromId): FeedItem {
    const fWithOwnerId: PostWithOwnerId | FWithFromIdAndOwnerId = {
        ...f,
        owner_id: f.from_id
    };

    return createItemModelWithNewId(type, fWithOwnerId, date);
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

            const itemModel = createItemModelIfNotExistFeed(parentType, p, item.date);

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
                | CommentVideoNoti | MentionCommentVideoNoti;

            const typeTokens = item.type
                .replace("mention_", "")
                .split("_");

            const feedbackType = typeTokens[0];
            const parentType = typeTokens[1];
            const p = noti.parent;

            const itemModel = createItemModelIfNotExistFeed(parentType, p, item.date);

            const f = noti.feedback;

            const feedbacks = createFeedbackWithFromId(feedbackType, item.date, f, p);

            itemModel.feedbacks
                .add(feedbacks);

            if (!itemModel.has('date') || itemModel.date < item.date) itemModel.date = item.date;

            itemModel.trigger('change');

            break;
        }


        // TODO: implement when `like_post` example will be available
/*        case "like_post": {
            const noti = item as LikePostNoti;

            if (noti.parent.text === "") return;

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

        autoUpdateNotificationsParams.start_time = autoUpdateCommentsParams.start_time = response.time;

        if (response.comments) {
            const newsAboutComments = <CommentsNews>response.comments;

            if (
                (notifications.items && notifications.items.length) ||
                (newsAboutComments.items && newsAboutComments.items.length)
            ) {
                newsAboutComments.profiles.forEach(p => profilesColl.set(p.id, p));
                newsAboutComments.groups.forEach(p => profilesColl.set(p.id, p));
                notifications.profiles.forEach(p => profilesColl.set(p.id, p));
                notifications.groups.forEach(p => profilesColl.set(p.id, p));

                notifications.items.forEach(addRawNotificationsItemV2);
                newsAboutComments.items.forEach(addRawCommentsItem);
                itemsColl.sort();
                publishData();
            }
        }
    }

    function handleError(e: Error) {
        if (e instanceof AccessTokenError) {
            console.error("Unsuccessful fetchFeedbacks... Retrying", e.message)
        }
        else console.error("Unsuccessful fetchFeedbacks... Retrying", e)
    }

    return RequestBg
        .api<FeedbackRS>({ code })
        .then(feedbackHandler)
        .catch(handleError)
        .then(fetchFeedbacksDebounced);
}


function tryNotification(): void {
    const itemModel = itemsColl.first();

    let notificationItem: ParentObj | FeedbackObjShort,
        type: string,
        parentType: string;

    // don't notify on first run,
    // when there is no previous value

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
        const profile = profilesColl.get(Math.abs(ownerId)) as UserProfile;
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
                title = makeTitle(I18N.get(`liked your ${parentType}`, { GENDER: gender }));
                break;
            case 'copy':
                title = makeTitle(I18N.get(`shared your ${parentType}`, { GENDER: gender }));
                break;
            case 'comment':
                // 'mention_commentS' type in notifications
            case 'comments':
            case 'reply':
                title = I18N.get('left a comment', { NAME: name, GENDER: gender });
                message = (<ReplyFeedback>notificationItem).text;
                break;

            default:
                console.warn("Unknown notification type in feedback", type);
                break;
        }

        if (title) {
            // Don't notify, when active tab is vk.com
            Browser.isVKSiteActive().then( (active) => {
                const feedbacksActive = Browser.isPopupOpened() && Router.isFeedbackTabActive();

                const image = profile.photo || profile.photo_50 || profile.photo_100 || profile.photo_200;

                if (!active) {
                    VKfoxNotifications.notify({
                        type   : NotifType.NEWS,
                        title,
                        message,
                        image,
                        noBadge: feedbacksActive,
                        noPopup: feedbacksActive,
                        sex    : profile.sex
                    });
                }
            });
        }


        function makeTitle(i18nText: string) { return `${name} ${i18nText}` }
    }
}

/**
 * Initialize all variables
 */
function initialize(readyPromise: Promise<void>): void {

    readyPromise.then( () => {
        itemsColl.on('add change', _.debounce( () => {
            itemsColl.sort();
            updateLatestFeedbackId();
            publishData();
        }, 1));

        updateLatestFeedbackId();
        publishData();
    });

    Mediator.sub(Msg.FeedbacksDataGet, () => readyPromise.then(publishData) );
}

