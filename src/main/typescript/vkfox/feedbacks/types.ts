import {AttachmentContainer, CanPostable, PhotoItem, VideoItem} from "../../vk/types/newsfeed";
import {LikesObj} from "../../vk/types/objects";
import {
    CommentsNewsItem,
    CopyItem,
    FeedbackComment,
    ParentComment,
    PorFPostItem,
    TopicItem,
    WithFromId
} from "../../vk/types/feedback";


export interface NewsLikesObj extends LikesObj {
    can_like   : number
    can_publish: number
}

export interface ParentObj {
    // TODO inherit for different parents
    owner_id    : number
    date: number
}

export interface ParentObjPost extends ParentObj, PorFPostItem {

}

export interface FeedbackObj {

    from_id ?: number
    date     : number

    type: string

    // added by VKfox ?
    feedback?: FeedbackObjShort;
}

export interface WallMentionFeedback extends FeedbackObj {
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

export interface CommentsNewsItemWithId extends CommentsNewsItem {
    id: number
    from_id: number
}

export interface ParentObjComment extends ParentObj {
   // Maybe if comment for post or for topic
    post?: CommentsNewsItemWithId
    id   : number
    topic?: TopicObj
}

export interface TopicFeedback extends ParentObj {
    source_id: number
    post_id : number
    text    : string
    likes       : LikesObj
}

export interface PhotoFeedback extends ParentObj {
    id: number
}

export interface VideoFeedback extends ParentObj {
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
    WithFromId[] | CopyItem[]

export type FeedbackWithOwnerId =
    FCommentWithOwnerId | FWithFromIdAndOwnerId

interface FCommentWithOwnerId extends FeedbackComment, WithOwnerId {}

interface FWithFromIdAndOwnerId extends WithFromId, WithOwnerId {}