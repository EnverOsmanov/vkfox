"use strict";
import * as Config from '../../../common/config/config'
import Mediator from '../../../mediator/mediator.pu'
import {Msg} from "../../../mediator/messages"

import {
    ParentObj,
    parentObjComment,
    ParentObjComment,
    ParentObjPost,
    PhotoParFromComm,
    SendMessageI,
    TopicParFromComm,
    VideoParFromComm,
    WallMentionFeedback
} from "../../../common/feedbacks/types";
import Request from "../components/request/request.pu";
import {BoardCreateComment, PhotosCreateComment, VideoCreateComment, WallCreateComment} from "../../../../vk/types";


export function unsubscribe(type: string, ownerId: number, itemId: number): void {
    const options = {
        type,
        owner_id: ownerId,
        item_id : itemId
    };

    Mediator.pub(Msg.FeedbacksUnsubscribe, options);
}

export function getActionsData(type: string, parent: ParentObj): SendMessageI | null {

    switch (type) {
        case 'wall':
        case 'post':
        case 'mention': {
            const wpmParent = (parent as WallMentionFeedback | ParentObjPost);
            if (wpmParent.comments.can_post) {
                return {
                    ownerId: wpmParent.source_id || (wpmParent as ParentObjPost).owner_id,
                    id: (wpmParent as any).id || wpmParent.post_id,
                    type: 'post'
                };
            }
            else return null;
        }

        case 'comment':
            const cmmntParent = parent as ParentObjComment;
            if ("post" in cmmntParent) {
                const {post} = cmmntParent as parentObjComment.Post;

                if (post.comments.can_post) {
                    return {
                        ownerId : post.from_id,
                        id      : post.id,
                        replyTo : (cmmntParent as any).id,
                        type    : "post"
                    };
                }
                else return null;
            }
            else if ("topic" in cmmntParent) {
                const {topic} = (cmmntParent as parentObjComment.Topic);

                return !topic.is_closed
                    ? getActionsData("topic", topic)
                    : null
            }
            else if ("photo" in cmmntParent) {
                const {photo} = (cmmntParent as parentObjComment.Photo);

                return getActionsData("photo", photo)
            }
            else if ("video" in cmmntParent) {
                const {video} = cmmntParent as parentObjComment.Video;

                return getActionsData("video", video)
            }
            else {
                console.warn("Unknown comment-parent", cmmntParent);
                return null
            }

        case "topic":
            const topicParent = parent as TopicParFromComm;
            return {
                ownerId: topicParent.owner_id,
                id     : topicParent.post_id,
                type
            };


        case 'video':
        case 'photo':
            const media = parent as PhotoParFromComm | VideoParFromComm;
            return {
                ownerId: media.owner_id,
                id     : media.id,
                type
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
            const commentP = parent as ParentObjComment;
            // generate link to parent item
            return ['post', 'topic', 'photo', 'video']
                .filter(Object.hasOwnProperty, commentP)
                .map((commentType) => {

                    const parentLink = getSourceLink(commentType, commentP[commentType]);
                    // replace query params
                    return parentLink.replace(/\?[^?]+$/, `?reply=${commentP.id}`);
                })[0];
        }

        case 'topic': {
            const topicP = parent as TopicParFromComm;

            const ownedPart = topicP.post_id || (topicP as any).id || (topicP as any).tid;

            return `${Config.VK_BASE}topic${topicP.owner_id}_${ownedPart}?offset=last&scroll=1`;
        }

        case 'photo': {
            const ownedPart = (parent as any).id || (parent as any).pid;

            return `${Config.VK_BASE}photo${parent.owner_id}_${ownedPart}`;
        }

        case 'video': {
            const ownedPart = (parent as any).id || (parent as any).vid;

            return `${Config.VK_BASE}video${parent.owner_id}_${ownedPart}`;
        }

        default:
            console.warn("Unknown newsfeed getSourceLink type", type)
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
                owner_id: scope.ownerId,
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



