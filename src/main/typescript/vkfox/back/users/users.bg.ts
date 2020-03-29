"use strict";
import RequestBg from '../request/request.bg';
import ProxyMethods from '../../proxy-methods/proxy-methods.bg'
import Mediator from "../../mediator/mediator.bg"
import * as _ from "underscore"
import {Msg, ProxyNames} from "../../mediator/messages"
import {NameSurname, OnlyName} from "../../common/chat/types";
import {UsersGetElem} from "./types";
import {FriendProfile, UserProfile} from "../../common/users/types";
import {FriendsRequest} from "../../../vk/types";


const DROP_PROFILES_INTERVAL = 60000,
    USERS_GET_DEBOUNCE       = 400;

let inProgress: boolean,
    usersGetQueue: UsersGetElem[],
    friendsProfilesDefer: Promise<FriendProfile[]>;

const usersColl: Map<number, UserProfile> = new Map();

const dropOldNonFriendsProfiles = _.debounce(function () {
    if (!inProgress) {
        usersColl.forEach(user => {
            if ("isFriend" in user) {
                const friendProfile: FriendProfile = user;
                if (!friendProfile.isFriend) {
                    usersColl.delete(friendProfile.id)
                }
            }
        });
    }
    dropOldNonFriendsProfiles();
}, DROP_PROFILES_INTERVAL);

/**
 * Resolves items from provided queue
 *
 * @param {Array} queue
 */
function publishUids(queue: UsersGetElem[]) {
    let data: UserProfile[],
        queueItem: UsersGetElem;

    function getProfileById(uid: number): UserProfile | undefined {
        const userM = _.clone(usersColl.get(uid));

        if (!userM) {
            console.debug("[publish] NOT FOUND", uid)
        }

        return userM;
    }

    while (queue.length) {
        queueItem = queue.pop();
        data = queueItem.uids
            .map( uid => getProfileById(uid) )
            .filter(up => up);

        queueItem.promise(data);
    }
}

const processGetUsersQueue = _.debounce( (processedQueue: UsersGetElem[]) => {
    const newUids = _
        .chain(processedQueue)
        .map(uge => uge.uids)
        .flatten()
        .unique()
        .difference([...usersColl.keys()])
        .value();


    // start new queue
    usersGetQueue = [];

    if (newUids.length) {
        inProgress = true;

        // TODO limit for uids.length
        RequestBg
            .api<UserProfile[]>({
                code: 'return API.users.get({user_ids: "' + newUids.join() + '", fields: "online,photo,sex,nickname,lists"})'
            })
            .then( (response) => {
                if (response && response.length) {
                    response.forEach(u => usersColl.set(u.id, u));
                    publishUids(processedQueue);
                    inProgress = false;
                }
            }).catch(console.debug);
    }
    else publishUids(processedQueue);
}, USERS_GET_DEBOUNCE);

function onUserChange(): void {
    inProgress = false;
    usersColl.clear();
    usersGetQueue = [];
    friendsProfilesDefer = null;
    dropOldNonFriendsProfiles()
}

class Users {

    /**
     * Initialize all variables
     */
    static init() {
        Mediator.sub(Msg.AuthUser, onUserChange);

        ProxyMethods.connect(ProxyNames.UsersBg, Users);
    }

    static getFriendsProfiles(): Promise<FriendProfile[]> {
        if (!friendsProfilesDefer) {
            friendsProfilesDefer = RequestBg.api<FriendsRequest>({
                code: 'return API.friends.get({ fields : "photo,sex,nickname,lists", order: "hints" })'
            }).then( (response) => {
                if (response && response.count) {
                    const friendProfiles: FriendProfile[] =
                        response.items
                            .map(friendData => {
                                return {
                                    ...friendData,
                                    isFriend: true
                                }
                            });

                    friendProfiles.forEach(f => usersColl.set(f.id, f));

                    return friendProfiles
                }
                else return [];
            }).catch(e => {
                console.error(e);
                return [];
            });
        }

        return friendsProfilesDefer;
    }

    /**
     * Returns profiles by ids
     * @param {Array<Number>} uids Array of user's uds
     *
     * @returns {Promise} Returns promise that will be fulfilled with profiles
     */
    static getProfilesById(uids: number[]): Promise<UserProfile[]> {
        function promisify(resolve: (_: UserProfile[]) => void) {

            usersGetQueue.push({
                uids: positiveUids,
                promise: resolve
            });
            processGetUsersQueue(usersGetQueue);
        }

        //communities have negative uids but they also can write a message
        const positiveUids = uids.filter(x => x > 0);

        return Users.getFriendsProfiles()
            .then( () => new Promise(promisify) );
    }

    static getName(input: OnlyName | NameSurname): string {

        return [].concat(input).map( (owner) => {
            //group profile
            if (owner.name) return owner.name;
            //user profile
            else return owner.first_name + ' ' + owner.last_name;
        }).join(', ');
    }
}

export default Users;