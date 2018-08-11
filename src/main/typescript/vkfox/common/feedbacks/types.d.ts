import {AttachmentContainer, CanPostable, PhotoItem, VideoItem} from "../../../vk/types/newsfeed";
import {UserLikesObj} from "../../../vk/types/objects";
import {
    CommentFromNews,
    CommentsNewsItem,
    CopyItem,
    FeedbackComment,
    ParentComment, PhotoCommentN,
    PorFPostItem, PostCommentN, TopicCommentN,
    TopicItem, VideoCommentN,
    WithFromId, WithLikes, WithUserLikes
} from "../../../vk/types/feedback";


export interface NewsLikesObj extends UserLikesObj {
    can_like   : number
    can_publish: number
}

export interface ParentObj {
    // TODO inherit for different parents
    owner_id    : number
}

export interface ParentObjPost extends ParentObj, PorFPostItem {

}

export interface FeedbackObj {
    id: string

    from_id ?: number
    date     : number

    type: string

    feedback: FeedbackObjShort;
}

export interface WallMentionFeedback extends FeedbackObjShort {
    comments    : CanPostable
    source_id?  : number
    post_id     : number
    text        : string

    attachments : AttachmentContainer[]
}


export interface ReplyFeedback extends FeedbackObjShort, WithLikes {
    date: number
    from_id: number
    id: number
    text      : string
}

export interface CommentsNewsItemWithId extends CommentsNewsItem {
    id: number
    from_id: number
}

export interface ParentObjComment extends ParentObj {
    id: number
}

declare namespace parentObjComment {

    interface Post extends ParentObjComment {
        post: CommentsNewsItemWithId
    }

    interface Topic extends ParentObjComment {
        topic: TopicParFromComm
    }

    interface Photo extends ParentObjComment {
        photo: PhotoParFromComm
    }

    interface Video extends ParentObjComment {
        video: VideoParFromComm
    }
}


export interface CommentsNewsItemPar extends ParentObj, CommentsNewsItem {}

export interface TopicParFromComm extends CommentsNewsItemPar, TopicCommentN {}
export interface PhotoParFromComm extends CommentsNewsItemPar, PhotoCommentN {}
export interface PostParFromComm extends CommentsNewsItemPar, PostCommentN {}
export interface VideoParFromComm extends CommentsNewsItemPar, VideoCommentN {}

export interface TopicFeedbackFromNoti extends ParentObj {
    id          : number
    title       : string
    comments    : number

    created     : number
    updated     : number
    likes       : UserLikesObj
}


export interface FeedbackObjShort {
    owner_id: number


    // added by VKfox ?
    attachments ?: AttachmentContainer[]
}

export interface FeedbackObjShortComment extends FeedbackObjShort, CommentFromNews {

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

export interface SendMessageI {
    type    : string
    id      : number
    ownerId : number
    replyTo?: number
}
