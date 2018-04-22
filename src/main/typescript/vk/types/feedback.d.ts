import {GroupProfile, UserProfile} from "../../vkfox/back/users/types";
import {Attachment, AttachmentPhoto, PhotoItem, PostItem, VideoItem} from "./newsfeed";
import {LikesObj} from "./objects";
import {GenericRS} from "./index";
import {NewsLikesObj} from "../../vkfox/feedbacks/types";


interface Notifications extends GenericRS<NotificationObj>{
    profiles: UserProfile[]
    groups  : GroupProfile[]

    last_viewed: number
}


interface Comment {
    id      : number
    date    : number
    text    : string
}

interface CommentReply {
    reply_to_comment : number
    reply_to_user    : number
}

interface WithLikes {
    from_id : number
    likes   : LikesObj
}

export interface CommentFromNews extends Comment, WithLikes {

}

interface FeedbackComment extends Comment, CommentReply {}

export interface ParentComment extends Comment, CommentReply {
    owner_id: number
    post    : PostItem
}

// Todo I didn't see real example of this type:
/*
export interface MentionOrWallPublish extends FeedbackComment, WithLikes {
    owner_id: number
}
*/


// Todo check for topic event
interface TopicItem {}
interface CopyItem {}
interface PorFPostItem extends PostItem {
    from_id: number
}

type NotificationType =
    "reply_comment" |
    "mention" |
    "friend_accepted" |
    "wall_publish" | "follow"



type FeedbackTypes =
    PorFPostItem |
    FeedbackComment |
    UserProfile[] | CopyItem[]

type ParentTypes =
    PorFPostItem |
    PhotoItem |
    VideoItem |
    ParentComment |
    TopicItem

//// Feedbacks

interface WithUsersF {
    feedback: UserProfile[]
}

interface WithPostF {
    feedback: PorFPostItem
}

interface WithCommentF {
    feedback: FeedbackComment
}


interface WithCopiesF {
    feedback: CopyItem[]
}


//// Parents

interface WithPostP {
    parent: PorFPostItem
}

interface WithPhotoP {
    parent: PhotoItem
}
interface WithVideoP {
    parent: VideoItem
}

interface WithCommentP {
    parent: ParentComment
}
interface WithTopicP {
    parent: TopicItem
}

export interface NotificationObj {
    type    : NotificationType
    date    : number/*
    parent  : ParentComment
    feedback: FeedbackComment*/

    reply   ?: Comment
}

interface FollowNoti extends NotificationObj, WithUsersF {
}

interface FriendAcceptedNoti extends NotificationObj, WithUsersF {

}

interface MentionNoti extends NotificationObj, WithPostF {
    // type = "mention"
}

interface MentionCommentsNoti extends NotificationObj, WithPostP, WithCommentF {

}

interface WallNoti extends NotificationObj, WithPostF {}
interface WallPublishNoti extends NotificationObj, WithPostF {}

interface CommentPostNoti extends NotificationObj, WithPostP, WithCommentF {}
interface CommentPhotoNoti extends NotificationObj, WithPhotoP, WithCommentF {}
interface CommentVideoNoti extends NotificationObj, WithVideoP, WithCommentF {}

interface ReplyCommentNoti extends NotificationObj, WithCommentP, WithCommentF {}
interface ReplyCommentPhotoNoti extends NotificationObj, WithCommentP, WithCommentF {}
interface ReplyCommentVideoNoti extends NotificationObj, WithCommentP, WithCommentF {}
interface ReplyCommentMarketNoti extends NotificationObj, WithCommentP, WithCommentF {}
interface ReplyTopicNoti extends NotificationObj, WithTopicP, WithCommentF {}

interface LikePostNoti extends NotificationObj, WithPostP, WithUsersF {}
interface LikeCommentNoti extends NotificationObj, WithCommentP, WithUsersF {}
interface LikePhotoNoti extends NotificationObj, WithPhotoP, WithUsersF {}
interface LikeVideoNoti extends NotificationObj, WithVideoP, WithUsersF {}

interface LikeCommentPhotoNoti extends NotificationObj, WithCommentP, WithUsersF {}
interface LikeCommentVideoNoti extends NotificationObj, WithCommentP, WithUsersF {}
interface LikeCommentTopicNoti extends NotificationObj, WithCommentP, WithUsersF {}

interface CopyPostNoti extends NotificationObj, WithPostP, WithCopiesF {}
interface CopyPhotoNoti extends NotificationObj, WithPhotoP, WithCopiesF {}
interface CopyVideoNoti extends NotificationObj, WithVideoP, WithCopiesF {}

interface MentionCommentPhotoNoti extends NotificationObj, WithPhotoP, WithCommentF {}
interface MentionCommentVideoNoti extends NotificationObj, WithVideoP, WithCommentF {}


interface CommentsNews {
    items: CommentsNewsItem[]

    profiles: UserProfile[]
    groups: GroupProfile[]
}

export interface FeedbackRS {
    notifications: Notifications
    comments     : CommentsNews | boolean
    time         : number
}

export type CommentsNewsType = "post" | "photo" | "topic"

export interface CommentsNewsItem {
    type        : CommentsNewsType
    date        : number
    text        : string
    comments    : CNewsCommentContainer
    likes       : NewsLikesObj
    source_id   : number
    post_id     : number
}

interface TopicFeedback extends CommentsNewsItem {
    // type = "topic"
}

export interface PhotoFeedback extends CommentsNewsItem, AttachmentPhoto {
    // type = "photo"
}

export interface PostFeedback extends CommentsNewsItem {
    // type = "post"

    from_id: number
    attachments: Attachment[]
}



interface CNewsCommentContainer {
    count   : number
    can_post: number

    list: CommentFromNews[]
}

interface CNewsCommentObjForGroups extends CNewsCommentContainer {
    groups_can_post: boolean

}