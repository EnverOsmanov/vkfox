import {ProfileI} from "../../../chat/types";
import {ItemObj} from "../types";

export interface FeedbacksData {
    profiles: ProfileI[],
    items   : ItemObj[]
}