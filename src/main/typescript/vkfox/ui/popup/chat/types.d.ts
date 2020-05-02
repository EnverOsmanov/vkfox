import {ChatUserProfileI} from "../../../common/chat/types";
import {GroupProfile, UserProfile} from "../../../common/users/types";
import {Message} from "../../../../vk/types";

export interface Speech {
    items   : Message[]
    out     : boolean
    author  : ChatUserProfileI
}


export interface MessageHistoryI {
    messages: Message[]
    profiles: UserProfile[]
}

export interface DialogI {
    id      : number
    //uid     : number
    messages: Message[]

    chat_active ?: number[]
    chat_id     ?: number
}

export interface ChatDataI {
    dialogs : DialogI[]
    profiles: ChatUserProfileI[]
    groups: GroupProfile[]
}


export interface ReplyI {
    visible     : boolean
}

export interface SendMessageParams {
    message: string
    chat_id?: number
    user_id?: number
}
