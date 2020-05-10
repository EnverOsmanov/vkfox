import {UserProfile} from "../users/types";
import {Message, VkConversation} from "../../../vk/types";

export interface GetHistoryParams {
    offset  : number
    count   : number
    peer_id?: number
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
    isWatched           : boolean
    originalIndex       ?: number
    lastActivityTime    ?: number
    description         ?: string
}


export interface DialogI {
    peer_id: number
    conversation: VkConversation
    messages: Message[]

    chat_active ?: number[]
}

