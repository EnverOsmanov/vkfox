import {UserProfile} from "../back/users/types";
import {Attachment, AttachmentContainer, CanPostable, PhotoItem, VideoItem} from "../../vk/types/newsfeed";
import {LikesObj} from "../../vk/types/objects";
import {
    CommentsNewsItem,
    CopyItem,
    FeedbackComment,
    ParentComment,
    PorFPostItem,
    TopicItem
} from "../../vk/types/feedback";


export interface NewsLikesObj extends LikesObj {
    can_like   : number
    can_publish: number
}

export interface FeedbackObj extends Attachment{
    owner_id?: number
    from_id ?: number
    date     : number
    likes    ?: LikesObj

    type: string

    // added by VKfox ?
    feedback?: FeedbackObjShort;
}

export interface WallPostMentionFeedback extends FeedbackObj {
    comments    : CanPostable
    source_id?  : number
    post_id     : number
    text        : string

    attachments : AttachmentContainer[]
}

export interface ReplyFeedback extends FeedbackObj {
    text      : string

    // added by VKfox ?
    attachments : AttachmentContainer[]
}

interface TopicObj {
    is_closed: boolean
}

interface CommentsNewsItemWithId extends CommentsNewsItem {
    id: number
}

export interface PostFeedback extends FeedbackObj {
    post?: CommentsNewsItemWithId
    id   : number
    topic?: TopicObj
}

export interface TopicFeedback extends FeedbackObj {
    source_id: number
    post_id : number
    text    : string
}

export interface PhotoFeedback extends FeedbackObj {
    id: number
}

export interface VideoFeedback extends FeedbackObj {
    id: number
}

export interface FeedbackObjShort {
    owner_id?: number


    // added by VKfox ?
    attachments ?: AttachmentContainer[]
}


export interface FoxCommentsNewsItem extends CommentsNewsItem {
    owner_id: number
}

export interface IdGeneretable {
    owner_id    ?: number
    id          ?: number
    post_id     ?: number
}

interface WithOwnerId {
    owner_id: number
}

export type ParentWithOwnerId =
    PostWithOwnerId |
    PhotoWithOwnerId |
    VideoWithOwnerId |
    ParentComment |
    TopicWithOwnerId

export interface PostWithOwnerId extends PorFPostItem, WithOwnerId {}
export interface PhotoWithOwnerId extends PhotoItem, WithOwnerId {}
export interface VideoWithOwnerId extends VideoItem, WithOwnerId {}
export interface TopicWithOwnerId extends TopicItem, WithOwnerId {}

export type FeedbackType =
    PorFPostItem |
    FeedbackComment |
    UserProfile[] | CopyItem[]