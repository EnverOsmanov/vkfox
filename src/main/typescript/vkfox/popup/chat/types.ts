import {PuChatUserProfile} from "../../chat/collections/ProfilesColl";
import {Message, ProfileI} from "../../chat/types";

export interface MessageMemo {
    items   : Message[]
    out     : boolean
    author  : ProfileI
}


export interface MessageHistoryI {
    messages: Message[]
    profiles: ProfileI[]
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
