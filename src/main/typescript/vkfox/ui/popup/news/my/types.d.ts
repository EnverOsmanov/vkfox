import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {FeedbackItemObj} from "../types";

export interface FeedbacksData {
    profiles: Map<number, UserProfile| GroupProfile>,
    items   : FeedbackItemObj[]
}