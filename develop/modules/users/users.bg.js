"use strict";
const DROP_PROFILES_INTERVAL = 60000,
    USERS_GET_DEBOUNCE       = 400,
    Vow                      = require('../shim/vow.js'),
    Backbone                 = require('backbone'),
    Mediator                 = require('../mediator/mediator.js'),
    Request                  = require('../request/request.bg.js'),
    ProxyMethods             = require('../proxy-methods/proxy-methods.js'),
    _                        = require('../shim/underscore.js')._;

let inProgress, usersGetQueue, friendsProfilesDefer;

const usersColl = new (Backbone.Collection.extend({
    model: Backbone.Model.extend({
        idAttribute: 'uid'
    })
}))(),
dropOldNonFriendsProfiles = _.debounce(function () {
    if (!inProgress) {
        usersColl.remove(usersColl.filter(function (model) {
            return !model.get('isFriend');
        }));
    }
    dropOldNonFriendsProfiles();
}, DROP_PROFILES_INTERVAL),
/**
 * Resolves items from provided queue
 *
 * @param {Array} queue
 */
publishUids = function (queue) {
    let data, queueItem;

    function getProfileById(uid) {
        return _.clone(usersColl.get(Number(uid)));
    }

    while (queue.length) {
        queueItem = queue.pop();
        data = queueItem.uids.map(function (uid) {
            return getProfileById(uid).toJSON();
        });

        queueItem.promise.fulfill(data);
    }
},
processGetUsersQueue = _.debounce(function () {
    const processedQueue = usersGetQueue,
        newUids = _
            .chain(processedQueue)
            .pluck('uids')
            .flatten()
            .unique()
            .difference(usersColl.pluck('uid'))
            .value();


    // start new queue
    usersGetQueue = [];

    if (newUids.length) {
        inProgress = true;

        // TODO limit for uids.length
        Request
            .api({
                code: 'return API.users.get({uids: "' + newUids.join() + '", fields: "online,photo,sex,nickname,lists"})'
            })
            .then(function (response) {
                if (response && response.length) {
                    usersColl.add(response);
                    publishUids(processedQueue);
                    inProgress = false;
                }
            });
    }
    else publishUids(processedQueue);
}, USERS_GET_DEBOUNCE);

initialize();

Mediator.sub('auth:success', function () {
    initialize();
});

dropOldNonFriendsProfiles();

module.exports = ProxyMethods.connect('../users/users.bg.js', _.extend({
    getFriendsProfiles: function () {
        if (!friendsProfilesDefer) {
            friendsProfilesDefer = Request.api({
                code: 'return API.friends.get({ fields : "photo,sex,nickname,lists", order: "hints" })'
            }).then(function (response) {
                if (response && response.length) {
                    response.forEach(function (friendData) {
                        friendData.isFriend = true;
                    });
                    usersColl.add(response);
                }
                return response;
            }.bind(this));
        }

        return friendsProfilesDefer;
    },
    /**
     * Returns profiles by ids
     * @param {Array<Number>} uids Array of user's uds
     *
     * @returns {Vow.promise} Returns promise that will be fulfilled with profiles
     */
    getProfilesById: function (uids) {
        //communities have negative uids but they also can write a message
        const positiveUids = uids.filter(x => x > 0);

        return this.getFriendsProfiles().then(function () {
            const promise = Vow.promise();

            usersGetQueue.push({
                uids   : positiveUids,
                promise: promise
            });
            processGetUsersQueue();
            return promise;
        });
    }
}, require('../users/name.js')));

/**
 * Initialize all variables
 */
function initialize() {
    inProgress = false;
    usersColl.reset();
    usersGetQueue = [];
    friendsProfilesDefer = null;
}