
import ProfilesCollection from "../profiles-collection/profiles-collection.bg"
import * as Backbone from "backbone"
import Request from "../request/request.bg"

class BuddiesCollection extends ProfilesCollection<Buddy> {
    model = Buddy;

    comparator = (buddie: Buddy) => {
        if (buddie.get('isWatched')) {
            if (buddie.get('lastActivityTime')) return -buddie.get('lastActivityTime');
            else return -2;
        }
        else if (buddie.get('isFave')) return -1;
        else return buddie.get('originalIndex') || 0;
    }
}

interface LastActivityI {
    online  : boolean
    time    : number
}

export class Buddy extends Backbone.Model {
    idAttribute: 'uid';

    get photo(): string { return super.get("photo")}

    // Automatically set last activity time
    // for all watched items
    initialize() {
        this.on('change:isWatched', function (model: Buddy) {
            function handleResponse(response: LastActivityI) {
                model
                    .set('online', response.online)
                    .set('lastActivityTime', response.time * 1000);

                buddiesColl.sort();
            }

            if (model.get('isWatched')) {
                const code = `return API.messages.getLastActivity({user_id: ${ model.get("uid") })`;

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