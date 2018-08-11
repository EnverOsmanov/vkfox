import {PuChatUserProfile} from "../../../common/chat/collections/ProfilesColl";
import {FoxUserProfileI} from "../../../common/chat/types";
import {UserProfile} from "../../../back/users/types";
import {Message} from "../../../../vk/types";

export interface Speech {
    items   : Message[]
    out     : boolean
    author  : FoxUserProfileI
}


export interface MessageHistoryI {
    messages: Message[]
    profiles: UserProfile[]
}

export interface DialogI {
    id      : string
    uid     : number
    messages: Message[]

    chat_active ?: number[]
    chat_id     ?: number
}

export interface ChatDataI {
    dialogs : DialogI[]
    profiles: PuChatUserProfile[]
}


export interface ReplyI {
    visible     : boolean
}

export interface SendMessageParams {
    message: string
    chat_id?: number
    user_id?: number
}
