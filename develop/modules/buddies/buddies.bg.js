"use strict";
const _                = require('underscore')._,
    Vow                = require('vow'),
    Backbone           = require('backbone'),
    Request            = require('../request/request.bg.js'),
    Mediator           = require('../mediator/mediator.js'),
    Users              = require('../users/users.bg.js'),
    I18N               = require('../i18n/i18n.js'),
    Notifications      = require('../notifications/notifications.bg.js'),
    PersistentSet      = require('../persistent-set/persistent-set.bg.js'),
    ProfilesCollection = require('../profiles-collection/profiles-collection.bg.js'),
    Msg                = require("../mediator/messages.js");


const watchedBuddiesSet = new PersistentSet('watchedBuddies');
const buddiesColl = new (ProfilesCollection.extend({
    model: Backbone.Model.extend({
        idAttribute: 'uid',
        // Automatically set last activity time
        // for all watched items
        initialize: function () {
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
    }),
    comparator: function (buddie) {
        if (buddie.get('isWatched')) {
            if (buddie.get('lastActivityTime')) return -buddie.get('lastActivityTime');
            else return -2;
        }
        else if (buddie.get('isFave')) return -1;
        else return buddie.get('originalIndex') || 0;
    }
}))();

const publishData = _.debounce( () => Mediator.pub(Msg.BuddiesData, buddiesColl.toJSON()), 0);

initialize();

// entry point
Mediator.sub(Msg.AuthSuccess, () => initialize() );

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
function initialize() {
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
        buddiesColl.on('change', function (model) {
            let gender;
            const profile = model.toJSON();

            if (profile.isWatched && model.changed.hasOwnProperty('online')) {
                model.set({
                    'lastActivityTime': Date.now()
                }, {silent: true});
                gender = profile.sex === 1 ? 'female':'male';

                Notifications.notify({
                    type: Notifications.BUDDIES,
                    title: [
                        Users.getName(profile),
                        I18N.get(profile.online ? 'is online':'went offline', {
                            GENDER: gender
                        })
                    ].join(' '),
                    image: model.get('photo'),
                    noBadge: true
                });

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
