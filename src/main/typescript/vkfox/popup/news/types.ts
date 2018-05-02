import {FeedbackObj, ParentObj} from "../../feedbacks/types";

export interface FeedbackItemObj {
    parent: ParentObj
    type  : string
    id    : string
    date  ?: number

    feedbacks       : FeedbackObj[]
}

export interface FeedbackUnsubOptions {
    type    : string
    owner_id: number
    item_id : number
}