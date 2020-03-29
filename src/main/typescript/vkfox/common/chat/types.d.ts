import {UserProfile} from "../users/types";

export interface GetHistoryParams {
    offset  : number
    count   : number
    chat_id?: number
    user_id?: number
}


export interface OnlyName {
    name: string
}

export interface NameSurname {
    first_name  : string
    last_name   : string
}

export interface ChatUserProfileI extends UserProfile {
    isSelf              ?: boolean
}


export interface FoxUserProfileI extends UserProfile {


    // Properties added by Vkfox
    isSelf              ?: boolean
    isWatched           ?: boolean
    lastActivityTime    ?: number
    description         ?: string
}
