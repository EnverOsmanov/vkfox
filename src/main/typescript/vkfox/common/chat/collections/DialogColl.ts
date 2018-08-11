import {Collection, Model} from "backbone";
import {BBCollectionOps} from "../../profiles-collection/profiles-collection.bg";
import {Message} from "../../../../vk/types";


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
        super.set("messages", value, BBCollectionOps.beSilentOptions)
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
