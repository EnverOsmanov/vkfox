
import GProfileColl, {GProfile} from "../profiles-collection/profiles-collection.bg"
import Request from "../request/request.bg"

class BuddiesCollection extends GProfileColl<Buddy> {
    model = Buddy;
    namme = "buddiesColl";

    comparator = (buddie: Buddy) => {
        if (buddie.isWatched) {
            if (buddie.lastActivityTime) return -buddie.lastActivityTime;
            else return -2;
        }
        else if (buddie.get("isFave")) return -1;
        else return buddie.get("originalIndex") || 0;
    }
}

interface LastActivityI {
    online  : number // 0 or 1
    time    : number
}

export class Buddy extends GProfile {
    get idAttribute(): string { return "uid" }

    get photo(): string { return super.get("photo")}
    get uid(): number { return super.get("uid")}

    get isWatched(): boolean { return super.get("isWatched")}
    set isWatched(value: boolean) { super.set("isWatched", value)}

    set online(value: number) { super.set("online", value)}

    get lastActivityTime(): number { return super.get("lastActivityTime")}
    set lastActivityTime(value: number) { super.set("lastActivityTime", value)}

    get originalIndex(): number { return super.get("originalIndex")}
    set originalIndex(value: number) { super.set("originalIndex", value)}

    // Automatically set last activity time
    // for all watched items

    parse(model: Buddy, options?: any): Buddy {
        model.id = model.uid;
        return model;
    }

    initialize(attrs?: any) {
        super.initialize(attrs);

        this.on("change:isWatched",  (model: Buddy) => {

            function handleResponse(response: LastActivityI): void {

                model.online = response.online;
                model.lastActivityTime = response.time * 1000;

                buddiesColl.sort();
            }

            if (model.isWatched) {
                const code = `return API.messages.getLastActivity({user_id: ${ model.uid }})`;

                Request.api({ code })
                    .then(handleResponse);
            }
            else model.unset("lastActivityTime");
            buddiesColl.sort();
        });
    }
}


const buddiesColl = new BuddiesCollection();

export default buddiesColl;