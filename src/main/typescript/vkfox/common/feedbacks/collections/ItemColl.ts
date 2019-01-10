import {AddOptions, Collection, Model} from "backbone";
import {FeedbacksCollection} from "./FeedBacksCollection";
import {ParentObj} from "../types";


class ItemAddOptions implements AddOptions {
    sort: boolean = false;

    merge?: boolean;
}


export class FeedItem extends Model {

    get date(): number {
        return super.get("date")
    }

    get feedbacks(): FeedbacksCollection {
        return super.get("feedbacks")
    }

    get parent(): ParentObj {
        return super.get("parent")
    }

    get type(): string {
        return super.get("type")
    }


    set feedbacks(value: FeedbacksCollection) {
        super.set("feedbacks", value)
    }

    set date(value: number) {
        super.set("date", value)
    }

}

export class ItemColl extends Collection<FeedItem> {
    model = FeedItem;

    constructor(models?: FeedItem[] | Object[], options?: any) {
        super(models, options);

        this.comparator = (model: FeedItem) => -model.date
    }

    static addOptions = new ItemAddOptions()
}

