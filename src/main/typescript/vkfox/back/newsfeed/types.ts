import {ItemObj} from "../../newsfeed/types";

export interface NewsfeedRequestParams {
    count       : number,
    start_time  ?: number
}

interface Newsfeed {
    profiles
    groups
    items: ItemObj[]
}

export interface NewsfeedResp {
    newsfeed: Newsfeed

    time    : number
}