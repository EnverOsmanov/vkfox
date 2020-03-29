import {DialogI} from "../../../ui/popup/chat/types";

export class DialogIUtils {

    static comparator = (a: DialogI, b: DialogI) => {
        const max = (d: DialogI) => Math.max(...d.messages.map(e => e.date));

        return max(b) - max(a);
    }
}
