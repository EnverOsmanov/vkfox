import {Collection, Model} from "backbone";
import {GroupObj, ProfileObj} from "./ProfilesColl";
import {Attachment, AttachmentContainer} from "../../newsfeed/models";

class Feedback extends Model {

    get date(): number {
        return super.get("date")
    }

    get type(): string {
        return super.get("type")
    }

    get feedback(): FeedbackObj {
        return super.get("feedback")
    }

    get id(): string {
        return super.get("id")
    }

}

export class FeedbacksCollection extends Collection<Feedback> {
    model = Feedback;

    constructor(models?: Feedback[] | Object[], options?: any) {
        super(models, options);

        this.comparator = (model: Feedback) => model.get('date')
    }
}

export interface LikesObj {
    count: number
    user_likes: number
}

export interface NewsLikesObj extends LikesObj {
    can_like   : number
    can_publish: number
}

export interface FeedbackObj extends Attachment{
    owner_id?: number
    from_id ?: number
    date     : number
    likes    : LikesObj

    type: string

    // added by VKfox ?
    feedback?: FeedbackObjShort;
}

export interface WallPostMentionFeedback extends FeedbackObj {
    comments    : CNewsCommentObj
    source_id?  : number
    id          ?: number
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

export interface PostFeedback extends FeedbackObj {
    post?: CommentsNewsItem
    id   : number
    topic?: TopicObj
}

export interface TopicFeedback extends FeedbackObj {
    id     ?: number
    tid    ?: number
    post_id : number
    text    : string
}

export interface PhotoFeedback extends FeedbackObj {
    id     ?: number
    pid     : number
}

export interface VideoFeedback extends FeedbackObj {
    id     ?: number
    vid     : number
}

export interface FeedbackObjShort {
    owner_id: number


    // added by VKfox ?
    attachments ?: AttachmentContainer[]
}

export interface NotificationObj {
    type    : string
    feedback: FeedbackObj | FeedbackObjShort[]
    parent  : FeedbackObj
    date    : number
}

interface CNewsCommentObj {
    count: number
    can_post: number

    list: FeedbackObj[]
}

export interface CommentsNewsItem {
    id          : number;
    type        : string
    from_id    ?: number
    source_id   : number
    likes       : NewsLikesObj


    comments    : CNewsCommentObj
    owner_id   ?: number
    date        : number

}

interface Notifications {
    items   : NotificationObj[]

    profiles: ProfileObj[]
    groups  : GroupObj[]
}

export interface CommentsNews {
    items: CommentsNewsItem[]

    profiles: ProfileObj[]
    groups: GroupObj[]
}

export interface FeedbackRS {
    notifications: Notifications
    comments     : CommentsNews | boolean
    time         : number
}