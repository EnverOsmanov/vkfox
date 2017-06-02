"use strict";
import Request from '../request/request.bg';
import ProxyMethods from '../proxy-methods/proxy-methods.bg'
import * as Vow from "vow"
import Mediator from "../mediator/mediator.bg"
import * as _ from "underscore"
import Msg from "../mediator/messages"
import {ProfilesColl} from "../chat/collections/ProfilesColl";

const DROP_PROFILES_INTERVAL = 60000,
    USERS_GET_DEBOUNCE       = 400;

let inProgress,
    usersGetQueue,
    friendsProfilesDefer;

const usersColl = new ProfilesColl();

const dropOldNonFriendsProfiles = _.debounce(function () {
    if (!inProgress) {
        usersColl.remove(usersColl.filter( model => !model.get('isFriend') ));
    }
    dropOldNonFriendsProfiles();
}, DROP_PROFILES_INTERVAL);

/**
 * Resolves items from provided queue
 *
 * @param {Array} queue
 */
function publishUids(queue: object[]) {
    let data, queueItem;

    function getProfileById(uid: number) {
        return _.clone(usersColl.get(Number(uid)));
    }

    while (queue.length) {
        queueItem = queue.pop();
        data = queueItem.uids.map( uid => getProfileById(uid).toJSON() );

        queueItem.promise(data);
    }
}

const processGetUsersQueue = _.debounce(function (processedQueue) {
    const newUids = _
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

Mediator.sub(Msg.AuthToken, () => initialize() );

dropOldNonFriendsProfiles();

class Users {

    static getFriendsProfiles(): Promise<any> {
        if (!friendsProfilesDefer) {
            friendsProfilesDefer = Request.api({
                code: 'return API.friends.get({ fields : "photo,sex,nickname,lists", order: "hints" })'
            }).then(function (response) {
                if (response && response.length) {
                    response.forEach(friendData => friendData.isFriend = true);
                    usersColl.add(response);
                }
                return response;
            }.bind(this));
        }

        return friendsProfilesDefer;
    }

    /**
     * Returns profiles by ids
     * @param {Array<Number>} uids Array of user's uds
     *
     * @returns {Vow.promise} Returns promise that will be fulfilled with profiles
     */
    static getProfilesById(uids: number[]): Promise<any[]> {
        //communities have negative uids but they also can write a message
        const positiveUids = uids.filter(x => x > 0);

        return Users.getFriendsProfiles().then(function () {
            function promisify(resolve) {
                usersGetQueue.push({
                    uids: positiveUids,
                    promise: resolve
                });
                processGetUsersQueue(usersGetQueue);
            }

            return new Vow.Promise(promisify);
        });
    }

    static getName(input): string {
        return [].concat(input).map(function (owner) {
            //group profile
            if (owner.name) return owner.name;
            //user profile
            else return owner.first_name + ' ' + owner.last_name;
        }).join(', ');
    }
}

ProxyMethods.connect('../users/users.bg.ts', Users);

    /**
 * Initialize all variables
 */
function initialize() {
    inProgress = false;
    usersColl.reset();
    usersGetQueue = [];
    friendsProfilesDefer = null;
}

export default Users;