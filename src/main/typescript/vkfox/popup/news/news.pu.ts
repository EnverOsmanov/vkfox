"use strict";
import * as Config from '../../config/config'
import Mediator from '../../mediator/mediator.pu'
import Msg from "../../mediator/messages"

import {
    CommentsNewsItemWithId,
    ParentObj,
    ParentObjComment,
    ParentObjPost,
    PhotoFeedback,
    TopicFeedbackFromComm,
    VideoFeedback,
    WallMentionFeedback
} from "../../feedbacks/types";
import Request from "../../request/request.pu";
import {BoardCreateComment, PhotosCreateComment, VideoCreateComment, WallCreateComment} from "../../../vk/types";
import {SendMessageI} from "../itemActions/types";
import {ParentComment} from "../../../vk/types/feedback";

export interface CommentsDataI {
    ownerId : number,
    id      : number
    type    : string

    replyTo?: number
}

export function unsubscribe(type: string, ownerId: number, itemId: number) {
    const options = {
        type,
        owner_id: ownerId,
        item_id : itemId
    };

    Mediator.pub(Msg.FeedbacksUnsubscribe, options);
}

export function getCommentsData(type: string, parent: ParentObj): CommentsDataI | undefined {

    switch (type) {
        case 'wall':
        case 'post':
        case 'mention':
            const wpmParent = (parent as WallMentionFeedback | ParentObjPost);
            if (wpmParent.comments.can_post) {
                return {
                    ownerId: wpmParent.source_id || (wpmParent as ParentObjPost).owner_id,
                    id     : (wpmParent as any).id || wpmParent.post_id,
                    type   : 'post'
                };
            }
            else return;

        case 'comment':
            const cmmntParent = <ParentObjComment>parent;
            if (cmmntParent.post && cmmntParent.post.comments.can_post) {
                const post = cmmntParent.post as CommentsNewsItemWithId;
                return {
                    ownerId: post.from_id,
                    id     : post.id,
                    replyTo: (cmmntParent as any).id,
                    type   : 'post'
                };
            }
            else if (cmmntParent.topic && !cmmntParent.topic.is_closed) {
                return getCommentsData("topic", cmmntParent.topic as any);
            }
            else {
                return ['photo', 'video']
                    .filter(Object.hasOwnProperty, parent)
                    .map( (commentType) => getCommentsData(commentType, parent[type]) )[0];
            }

        case "topic":
            const topicParent = parent as TopicFeedbackFromComm;
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

        case "follow":
        case "friend_accepted": {
            return null;
        }

        default:
            console.warn("Unknown feedback type", type);
            return null;
    }
}

export function getSourceLink(type: string, parent: ParentObj): string {

    switch (type) {
        // case 'mention':
        case 'wall':
        case 'post': {
            const wpmParent = (parent as WallMentionFeedback | ParentObjPost);

            const ownerPart = "to_id" in wpmParent
                ? wpmParent.to_id
                : wpmParent.source_id;

            const ownedPart = "post_id" in wpmParent
                ? wpmParent.post_id
                : (wpmParent as any).id;

            return `${Config.VK_BASE}wall${ownerPart}_${ownedPart}?offset=last&scroll=1`;
        }

        case 'comment': {
            const commentP = parent as ParentComment;
            // generate link to parent item
            return ['post', 'topic', 'photo', 'video']
                .filter(Object.hasOwnProperty, commentP)
                .map((commentType) => {

                    const parentLink = getSourceLink(commentType, commentP[commentType]);
                    // replace query params
                    return parentLink.replace(/\?[^?]+$/, '?reply=' + commentP.id);
                })[0];
        }

        case 'topic': {
            const topicP = parent as TopicFeedbackFromComm;

            const ownedPart = topicP.post_id || (topicP as any).id || (topicP as any).tid;

            return `${Config.VK_BASE}topic${parent.owner_id}_${ownedPart}?offset=last&scroll=1`;
        }

        case 'photo': {
            const ownedPart = (parent as any).id || (parent as any).pid;

            return `${Config.VK_BASE}photo${parent.owner_id}_${ownedPart}`;
        }

        case 'video': {
            const ownedPart = (parent as any).id || (parent as any).vid;

            return `${Config.VK_BASE}video${parent.owner_id}_${ownedPart}`;
        }
    }
}

export function onReply(scope: SendMessageI, message: string): Promise<void> {
    let method: string;
    let params: WallCreateComment | BoardCreateComment | PhotosCreateComment | VideoCreateComment;

    switch (scope.type) {
        case "comment":
        case 'wall':
        case 'post':
            const wallP: WallCreateComment = {
                owner_id: scope.ownerId,
                post_id: scope.id,
                message
            };
            if (scope.replyTo) {

                wallP.reply_to_comment = scope.replyTo;
            }

            params = wallP;
            method = "wall.createComment";
            break;

        case 'topic':
            const topicP: BoardCreateComment = {
                group_id: Math.abs(scope.ownerId),
                topic_id: scope.id,
                message
            };

            params = topicP;
            method = 'board.createComment';
            break;

        case 'photo':
            const photosP: PhotosCreateComment = {
                owner_id: Math.abs(scope.ownerId),
                photo_id: scope.id,
                message
            };

            params = photosP;
            method = 'photos.createComment';
            break;

        case 'video':
            const videoP: VideoCreateComment = {
                owner_id: Math.abs(scope.ownerId),
                video_id: scope.id,
                message
            };

            params = videoP;
            method = 'video.createComment';
            break;

        default:
            console.warn("Unknown newsfeed type", scope.type);
    }

    if (method) {

        return Request.directApi<void>(method, params)
            .catch(err => console.error("Couldn't send message", err));
    }
    else return Promise.resolve();
}



