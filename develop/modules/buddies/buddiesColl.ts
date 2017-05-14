
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

export class Buddy extends Backbone.Model {
    idAttribute: 'uid';

    get photo(): string { return super.get("photo")}

    // Automatically set last activity time
    // for all watched items
    initialize() {
        this.on('change:isWatched', function (model) {
            if (model.get('isWatched')) {
                Request.api({
                    code: 'return API.messages.getLastActivity({user_id: ' + model.get('uid') + '})'
                }).then(function (response) {
                    model
                        .set('online', response.online)
                        .set('lastActivityTime', response.time * 1000);

                    buddiesColl.sort();
                });
            }
            else model.unset('lastActivityTime');
            buddiesColl.sort();
        });
    }
}


const buddiesColl = new BuddiesCollection();

export default buddiesColl;