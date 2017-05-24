import {Collection, Model} from "backbone";
import {GroupObj, ProfileObj} from "./ProfilesColl";

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

interface CommentsLikesObj extends LikesObj {
    can_like   : number
    can_publish: number
}

export interface FeedbackObj {
    owner_id?: number
    from_id ?: number
    date     : number
    likes    : LikesObj
}

export interface WallPostMentionFeedback extends FeedbackObj {
    comments  : CommentCommentObj
    source_id?: number
    id       ?: number
    post_id   : number
    text      : string
}

export interface ReplyFeedback extends FeedbackObj {
    text      : string
}

interface TopicObj {
    is_closed: boolean
}

export interface PostFeedback extends FeedbackObj {
    post?: CommentObj
    id   : number
    topic?: TopicObj
}

export interface TopicFeedback extends FeedbackObj {
    id     ?: number
    tid    ?: number
    post_id : number
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
}

export interface NotificationObj {
    type    : string
    feedback: FeedbackObj | FeedbackObjShort[]
    parent  : FeedbackObj
    date    : number
}

interface CommentCommentObj {
    count: number
    can_post: number

    list: FeedbackObj[]
}

export interface CommentObj {
    id: number;
    type: string
    from_id: number
    source_id: number
    likes: CommentsLikesObj


    comments: CommentCommentObj
    owner_id?: number
    date: number

}

interface Notifications {
    items   : NotificationObj[]

    profiles: ProfileObj[]
    groups  : GroupObj[]
}

interface Comments {
    items: CommentObj[]

    profiles: ProfileObj[]
    groups: GroupObj[]
}

export interface FeedbackRS {
    notifications: Notifications
    comments     : Comments
    time         : number
}