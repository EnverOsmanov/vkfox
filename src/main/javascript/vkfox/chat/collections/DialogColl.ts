import {Collection, Model, ModelSetOptions} from "backbone";

class DialogSetOptions implements ModelSetOptions {
    silent = true
}

export interface Message {
    mid         : number;
    uid         : number;
    chat_id    ?: string;
    chat_active : number[];
    read_state  : number;
    date        : number;
    out         : number;
    body        : string
}

export class Dialog extends Model {

    get uid(): number {
        return super.get("uid")
    }

    get chat_id(): string {
        return super.get("chat_id")
    }

    get messages(): Message[] {
        return super.get("messages")
    }

    get chat_active(): number[] {
        return super.get("chat_active")
    }

    set messages(value: Message[]) {
        super.set("messages", value, Dialog.setOptions)
    }

    static setOptions = new DialogSetOptions()
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
