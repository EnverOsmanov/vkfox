import {AttachmentContainer} from "../newsfeed/types";
import {UserProfile} from "../back/users/types";

export interface GetHistoryParams {
    offset  : number
    count   : number
    chat_id?: number
    user_id?: number
}

export interface Message {
    mid         : number;
    uid         : number;
    chat_id    ?: number;
    read_state  : number;
    date        : number;
    out         : number;
    body        : string
    title       : string
    attachments?: AttachmentContainer[]

    chat_active ?: number[];
}

export interface OnlyName {
    name: string
}

export interface NameSurname {
    first_name  : string
    last_name   : string
}


export interface ProfileI extends UserProfile {


    // Properties added by Vkfox
    id                   : number
    gid                 ?: number
    isSelf              ?: boolean
    isWatched           ?: boolean
    lastActivityTime    ?: number
    description         ?: string
}
