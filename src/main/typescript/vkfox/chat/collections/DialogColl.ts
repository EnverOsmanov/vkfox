import {Collection, Model} from "backbone";
import {Profiles} from "../../feedbacks/collections/ProfilesColl";
import {AttachmentContainer} from "../../newsfeed/types";
import {Profile, ProfileI} from "./ProfilesColl";

export interface ChatDataI {
    dialogs : DialogI[]
    profiles: Profile[]
}

export interface GetHistoryParams {
    offset  : number
    count   : number
    chat_id?: number
    user_id?: number
}

export interface SendMessageParams {
    message  : string
    chat_id ?: number
    uid     ?: number
}

export interface MessageHistoryI {
    messages: Message[]
    profiles: ProfileI[]
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

export interface MessageMemo {
    items   : Message[]
    out     : boolean
    author  : ProfileI
}

export interface DialogI {
    id      : string
    uid     : number
    messages: Message[]

    chat_active ?: number[]
    chat_id     ?: number
}

export class Dialog extends Model {

    get uid(): number {
        return super.get("uid")
    }

    get chat_id(): number {
        return super.get("chat_id")
    }

    get messages(): Message[] {
        return super.get("messages")
    }

    get chat_active(): number[] {
        return super.get("chat_active")
    }

    set messages(value: Message[]) {
        super.set("messages", value, Profiles.beSilentOptions)
    }

}

export class DialogColl extends Collection<Dialog> {
    model = Dialog;

    constructor(models?: Dialog[] | Object[], options?: any) {
        super(models, options);

        this.comparator = (dialog: Dialog) => {
            const messages = dialog.messages;
            return - messages[messages.length - 1].date;
        }
    }
}
