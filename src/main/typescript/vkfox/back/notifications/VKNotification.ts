import * as Backbone from "backbone";
import {Sex} from "../../common/users/types";


export class NotifType {
    static CHAT = "chat";
    static BUDDIES = "buddies";
    static NEWS = "news"
}

export class VKNotification extends Backbone.Model {

    get noBadge(): boolean {
        return super.get("noBadge")
    }

    get message(): string {
        return super.get("message");
    }

    get sex(): Sex {
        return super.get("sex");
    }
}