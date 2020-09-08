import {Collection, Model} from "backbone";
import {FeedbackObj, FeedbackObjShort} from "../types";

class Feedback extends Model {

    get date(): number {
        return super.get("date")
    }

    get type(): string {
        return super.get("type")
    }

    get feedback(): FeedbackObjShort {
        return super.get("feedback")
    }

}

export class FeedbacksCollection extends Collection<Feedback> {
    model = Feedback;

    constructor(models?: Feedback[] | Object[], options?: any) {
        super(models, options);

        this.comparator = (model: Feedback) => model.get('date')
    }
}
