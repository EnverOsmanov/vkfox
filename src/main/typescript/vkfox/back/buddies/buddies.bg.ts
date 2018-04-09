"use strict";
import Request from "../../request/request.bg"
import * as _ from "underscore"
import Mediator from "../../mediator/mediator.bg"
import Users from "../users/users.bg"
import I18N from "../../i18n/i18n"
import Notifications from "../../notifications/notifications.bg"
import PersistentSet from "../persistent-set/persistent-set.bg"
import Msg from "../../mediator/messages"
import buddiesColl, {Buddy} from "../../buddies/buddiesColl";
import {NotifType} from "../../notifications/Notification"
import {ProfilesCmpn} from "../../profiles-collection/profiles-collection.bg";
import {ProfileI} from "../../chat/types";
import {UserI} from "../users/types";


const watchedBuddiesSet = new PersistentSet("watchedBuddies");

const publishData = _.debounce( () => Mediator.pub(Msg.BuddiesData, buddiesColl.toJSON()), 0);

/**
 * Initialize all state
 */
export default function initialize() {
    const readyPromise = Promise.all([
        Users.getFriendsProfiles(),
        getFavouriteUsers()
    ]).then( ([friends, favourites]) => {
        buddiesColl.reset([].concat(favourites, friends));

        saveOriginalBuddiesOrder();
        setWatchedBuddies();
    });

    readyPromise.then(publishData);

    Mediator.sub(Msg.BuddiesDataGet, () => readyPromise.then(publishData) );

    readyPromise.then( () => {
        buddiesColl.on("change", (model: Buddy) => {
            const profile: ProfileI = model.toJSON();

            if (profile.isWatched && model.changed.hasOwnProperty("online")) {

                model.set({ "lastActivityTime": Date.now() }, ProfilesCmpn.beSilentOptions);
                const gender = profile.sex === 1 ? "female":"male";

                const title = [
                    Users.getName(profile),
                    I18N.get(profile.online ? "is online":"went offline", { GENDER: gender })
                ].join(" ");

                Notifications.notify({
                    title,
                    image  : model.photo,
                    type   : NotifType.BUDDIES,
                    noBadge: true
                });

                buddiesColl.sort();
            }
            publishData();
        });
    });


    Mediator.sub(Msg.BuddiesWatchToggle, (uid: number) => {

        if (watchedBuddiesSet.contains(uid)) {
            watchedBuddiesSet.remove(uid);
            const buddy = buddiesColl.get(uid);
            buddy.unset("isWatched");
        }
        else {
            watchedBuddiesSet.add(uid);
            
            const buddy = buddiesColl.get(uid);
            buddy.isWatched = true;
        }
    });
}

/**
 * After changing and unchanging any field of buddie,
 * we need to place it to original place in list,
 * So we add index property.
 * Runs once.
 */
function saveOriginalBuddiesOrder() {
    const length = buddiesColl.length;

    if (length && !buddiesColl.last().originalIndex) {
        buddiesColl.forEach(
            (buddie, i) => buddie.originalIndex = i
        );
    }
}


/**
 * Returns profiles from bookmarks,
 * and sets "isFave=true" on profile object
 *
 * @returns [jQuery.Deferred]
 */
function getFavouriteUsers(): Promise<ProfileI[]> {
    return Request
        .api({ code: "return API.fave.getUsers()" })
        .then( (response: (number | UserI)[]) => {
            const uids = response
                .slice(1)
                .map((u: UserI) => u.uid);

            return Users
                .getProfilesById(uids)
                .then( profiles => {
                    return profiles.map( profile => {
                        profile.isFave = true;

                        return profile
                    } );
                });
        });
}

/**
 * Extends buddiesColl with information
 * about watched persons
 */
function setWatchedBuddies() {
    watchedBuddiesSet
        .toArray()
        .forEach( uid => {
            const model = buddiesColl.get(uid);
            if (model) model.isWatched = true;
        });
}
