import {UserProfile} from "../../../back/users/types";
import {FeedbackItemObj} from "../types";

export interface FeedbacksData {
    profiles: UserProfile[],
    items   : FeedbackItemObj[]
}