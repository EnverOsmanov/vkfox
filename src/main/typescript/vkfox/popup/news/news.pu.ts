"use strict";
import * as Config from '../../config/config'
import Mediator from '../../mediator/mediator.pu'
import Msg from "../../mediator/messages"

import {
    PhotoFeedback,
    PostFeedbackNot,
    PostParent,
    TopicFeedback,
    VideoFeedback,
    WallMentionFeedback
} from "../../feedbacks/types";
import {FeedbackItemObj} from "./types";

export interface CommentsDataI {
    ownerId : number,
    id      : number
    type    : string

    replyTo?: number
}

export function unsubscribe(type, ownerId, itemId) {
    const options = {
        type    : type,
        owner_id: ownerId,
        item_id : itemId
    };

    Mediator.pub(Msg.FeedbacksUnsubscribe, options);
}

export function getCommentsData(item: FeedbackItemObj): CommentsDataI | undefined {
    const { parent } = item;

    if (item.type !== "post" && item.type !== "topic") {
        console.debug("NewsPu", item.type, (parent as any).id, parent);
    }

    switch (item.type) {
        case 'wall':
        case 'post':
        case 'mention':
            const wpmParent = (parent as WallMentionFeedback | PostParent);
            if (wpmParent.comments.can_post) {
                return {
                    ownerId: wpmParent.source_id || wpmParent.owner_id,
                    id     : (wpmParent as any).id || wpmParent.post_id,
                    type   : 'post'
                };
            }
            else return;

        case 'comment':
            const cmmntParent = <PostFeedbackNot>parent;
            if (cmmntParent.post && cmmntParent.post.comments.can_post) {
                const post = cmmntParent.post as PostFeedbackNot;
                return {
                    ownerId: post.from_id,
                    id     : post.id,
                    replyTo: (cmmntParent as any).id,
                    type   : 'post'
                };
            }
            else if (cmmntParent.topic && !cmmntParent.topic.is_closed) {
                return this.getCommentsData({
                    type: 'topic',
                    parent: cmmntParent.topic
                });
            }
            else {
                const a = ['photo', 'video']
                    .filter(Object.hasOwnProperty, parent)
                    .map(function (type) {
                        return this.getSourceLink({type: type, parent: parent[type]});
                    }, this)[0];

                return a;
            }
        case "topic":
            const topicParent = parent as TopicFeedback;
            return {
                ownerId: topicParent.owner_id,
                id     : topicParent.post_id,
                type   : "topic"
            };
        case 'photo':
            const phParent = <PhotoFeedback>parent;
            return {
                ownerId: phParent.owner_id,
                id     : phParent.id,
                type   : 'photo'
            };
        case 'video':
            const viParent = <VideoFeedback>parent;
            return {
                ownerId: viParent.owner_id,
                id     : viParent.id,
                type   : 'video'
            };

            default:
                console.warn("Unknown feedback type", item.type)
    }
}

export function getSourceLink(item): string {
    const parent = item.parent;

    switch (item.type) {
        case 'wall':
        case 'post':
            // case 'mention':
            return Config.VK_BASE + 'wall'
                + (parent.to_id || parent.source_id) + '_'
                + (parent.post_id || parent.id) + '?offset=last&scroll=1';
        case 'comment':
            // generate link to parent item
            return ['post', 'topic', 'photo', 'video']
                .filter(Object.hasOwnProperty, parent)
                .map(function (type) {
                    const parentLink = getSourceLink({type: type, parent: parent[type]});
                    // replace query params
                    return parentLink.replace(/\?[^?]+$/, '?reply=' + item.parent.id);
                }, this)[0];
        case 'topic':
            return Config.VK_BASE + 'topic' + parent.owner_id
                + '_' + (parent.id || parent.post_id || parent.tid)
                + '?offset=last&scroll=1';
        case 'photo':
            return Config.VK_BASE + 'photo' + parent.owner_id
                + '_' + (parent.id || parent.pid);
        case 'video':
            return Config.VK_BASE + 'video' + parent.owner_id
                + '_' + (parent.id || parent.vid);
    }
}


