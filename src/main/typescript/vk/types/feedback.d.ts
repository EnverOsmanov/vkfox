import {GroupProfile, UserProfile} from "../../vkfox/common/users/types";
import {media, PhotoItem, PostItem, VideoItem} from "./newsfeed";
import {LikesObj, UserLikesObj} from "./objects";
import {GenericRS} from "./index";
import {NewsLikesObj} from "../../vkfox/common/feedbacks/types";
import {Attachment} from "./attachment";

export type ZeroOne = 0 | 1;

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
    likes   : LikesObj
}

interface WithUserLikes {
    likes   : UserLikesObj
}

export interface CommentFromNews extends Comment, WithUserLikes {
    deleted ?: boolean
    from_id ?: number
}

interface FeedbackComment extends Comment, CommentReply {
    // в доке нету, а прислывают
    from_id: number
}

export interface ParentComment extends Comment, CommentReply {
    owner_id: number
}

// Todo I didn't see real example of this type:
/*
export interface MentionOrWallPublish extends FeedbackComment, WithUserLikes {
    owner_id: number
}
*/


// Todo check for topic event
interface TopicItem {
    id: number
    owner_id: number
    title: string
    created: number
}
interface CopyItem {}
interface PorFPostItem extends PostItem {
    from_id : number
    to_id   : number
}

type NotificationType =
    "reply_comment"
    | "mention"
    | "friend_accepted"
    | "wall_publish"
    | "follow"
    | "mention_comments"
    | "reply_comment_photo"
    | "reply_comment_video"
    | "reply_topic"

    | "like_comment"
    | "like_comment_photo"
    | "like_comment_video"
    | "like_comment_topic"

    | "comment_photo"
    | "mention_comment_photo"

    | "comment_video"
    | "mention_comment_video"

    | "like_post"


type FeedbackTypes =
    PorFPostItem |
    FeedbackComment |
    GenericRS<UserProfile> | GenericRS<CopyItem>

type ParentTypes =
    PorFPostItem |
    PhotoItem |
    VideoItem |
    ParentComment |
    TopicItem

//// Feedbacks

interface WithFromId {
    from_id: number
}

interface WithUsersF {
    feedback: GenericRS<WithFromId>
}

interface WithPostF {
    feedback: PorFPostItem
}

interface WithCommentF {
    feedback: FeedbackComment
}


interface WithCopiesF {
    feedback: GenericRS<CopyItem>
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

export type CommentsNewsType = "post" | "photo" | "topic" | "video"

export interface CommentsNewsItem {
    type        : CommentsNewsType // в фидбеке коммента к посту может нету
    date        : number
    text        : string
    comments    : CNewsCommentContainer
    likes       : NewsLikesObj
    source_id   : number
    post_id     : number
}

interface TopicCommentN extends CommentsNewsItem {
    // type = "topic"
    is_closed: boolean
}

export interface PhotoCommentN extends CommentsNewsItem, media.Photo {
    // type = "photo"
}

export interface PostCommentN extends CommentsNewsItem {
    // type = "post"

    from_id: number
    attachments?: Attachment[]
}

export interface VideoCommentN extends CommentsNewsItem, media.Video {

}



interface CNewsCommentContainer {
    count   : number
    can_post: 0 | 1

    list: CommentFromNews[]
}

interface CNewsCommentObjForGroups extends CNewsCommentContainer {
    groups_can_post: boolean

}