import {ChatUserProfileI, DialogI} from "../../../common/chat/types";
import {GroupProfile, UserProfile} from "../../../common/users/types";
import {Message, Peer, VkConversation} from "../../../../vk/types";

export interface Speech {
    items   : Message[]
    out     : boolean
    author  : ChatUserProfileI
}


export interface MessageHistoryI {
    messages: Message[]
    profiles: UserProfile[]
    groups: GroupProfile[]
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
    random_id: number
    peer_id?: number
    chat_id?: number
    user_id?: number
}
