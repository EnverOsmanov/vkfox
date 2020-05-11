import {GroupProfile, UserProfile} from "../../../../common/users/types";
import {FeedbackItemObj} from "../types";

export interface FeedbacksData {
    profiles: [number, UserProfile| GroupProfile][],
    items   : FeedbackItemObj[]
}