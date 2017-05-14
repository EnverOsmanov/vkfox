"use strict";
import Request from '../request/request.bg'
import * as _ from "underscore"
import * as Vow from "vow"
import Mediator from "../mediator/mediator.bg"
import Users from "../users/users.bg"
import I18N from "../i18n/i18n"
import Notifications from "../notifications/notifications.bg"
import PersistentSet from "../persistent-set/persistent-set.bg"
import Msg from "../mediator/messages"
import buddiesColl, {Buddy} from "./buddiesColl";
import {NotifType, VKNotification} from "../notifications/Notification"


const watchedBuddiesSet = new PersistentSet('watchedBuddies');


const publishData = _.debounce( () => Mediator.pub(Msg.BuddiesData, buddiesColl.toJSON()), 0);


// entry point
Mediator.sub(Msg.AuthSuccess, initialize);

Mediator.sub(Msg.BuddiesWatchToggle, function (uid) {
    if (watchedBuddiesSet.contains(uid)) {
        watchedBuddiesSet.remove(uid);
        buddiesColl.get(uid).unset('isWatched');
    }
    else {
        watchedBuddiesSet.add(uid);
        buddiesColl.get(uid).set('isWatched', true);
    }
});

/**
 * Initialize all state
 */
export default function initialize() {
    const readyPromise = Vow.all([
        Users.getFriendsProfiles(),
        getFavouriteUsers()
    ]).then( ([friends, favourites]) => {
        buddiesColl.reset([].concat(favourites, friends));

        saveOriginalBuddiesOrder();
        setWatchedBuddies();
    });

    readyPromise.then(publishData);

    Mediator.sub(Msg.BuddiesDataGet, () => readyPromise.then(publishData) );

    readyPromise.then(function () {
        buddiesColl.on('change', (model: Buddy) => {
            const profile = model.toJSON();

            if (profile.isWatched && model.changed.hasOwnProperty('online')) {
                model.set({
                    'lastActivityTime': Date.now()
                }, {silent: true});
                const gender = profile.sex === 1 ? 'female':'male';

                const title = [
                    Users.getName(profile),
                    I18N.get(profile.online ? 'is online':'went offline', {
                        GENDER: gender
                    })
                ].join(' ');

                Notifications.notify(new VKNotification({
                    title,
                    image  : model.photo,
                    type   : NotifType.BUDDIES,
                    noBadge: true
                }));

                buddiesColl.sort();
            }
            publishData();
        });
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

    if (length && !buddiesColl.at(length - 1).get('originalIndex')) {
        buddiesColl.forEach(
            (buddie, i) => buddie.set('originalIndex', i)
        );
    }
}


/**
 * Returns profiles from bookmarks,
 * and sets "isFave=true" on profile object
 *
 * @returns [jQuery.Deferred]
 */
function getFavouriteUsers() {
    return Request
        .api({ code: 'return API.fave.getUsers()' })
        .then( response => {
            const uids = _.pluck(response.slice(1), 'uid');

            return Users
                .getProfilesById(uids)
                .then( profiles => {
                    profiles.forEach( profile => profile.isFave = true );
                    return profiles;
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
            if (model) model.set('isWatched', true)
        });
}
