import {FeedbackObj} from "../../feedbacks/types";

export interface ItemObj {
    parent: FeedbackObj
    type  : string
    id    : string
    date  : number

    // added by VKfox
    feedbacks       : FeedbackObj[]
}