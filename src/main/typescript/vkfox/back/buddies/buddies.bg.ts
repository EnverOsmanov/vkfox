"use strict";
import RequestBg from "../request/request.bg"
import Mediator from "../../mediator/mediator.bg"
import Users from "../users/users.bg"
import I18N from "../../common/i18n/i18n"
import VKfoxNotifications from "../notifications/notifications.bg"
import PersistentSet from "../persistent-set/persistent-set.bg"
import {Msg} from "../../mediator/messages"
import {NotifType} from "../notifications/VKNotification"
import {GProfileCollCmpn} from "../profiles-collection/profiles-collection.bg";

import {FaveGetUsersResponse, MessagesLastActivityResponse} from "../../../vk/types";
import {FoxUserProfileI} from "../../common/chat/types";


const watchedBuddiesSet = new PersistentSet("watchedBuddies");

const buddiesColl: Map<number, FoxUserProfileI> = new Map();

function publishData() {
    Mediator.pub(Msg.BuddiesData, [...buddiesColl.values()])
}

/**
 * Initialize all state
 */
export default function initialize() {
    GProfileCollCmpn.subscribeForLpUpdates(buddiesColl);

    const readyPromise = Promise.all([
        Users.getFriendsProfiles(),
        getFavouriteUsers()
    ]).then( ([friends, favourites]) => {
        buddiesColl.clear();
        friends
            .map(u => {return {...u, isWatched: false}})
            .forEach(u => buddiesColl.set(u.id, u));
        favourites.forEach(u => buddiesColl.set(u.id, u));

        saveOriginalBuddiesOrder();
        setWatchedBuddies();
    });

    Mediator.sub(Msg.BuddiesDataGet, () => readyPromise.then(publishData) );

    readyPromise.then( () => {
        Mediator.sub(Msg.LongpollUpdates, onLongPollUpdate);
    });


    Mediator.sub(Msg.BuddiesWatchToggle, (uid: number) => {

        const buddy = buddiesColl.get(uid);

        if (watchedBuddiesSet.contains(uid)) {
            watchedBuddiesSet.remove(uid);
            buddy.isWatched = false;
        }
        else {
            watchedBuddiesSet.add(uid);
            
            buddy.isWatched = true;
            setLastActivityTime(buddy)
        }
        sortBuddies();
        publishData();
    });
}

/**
 * After changing and unchanging any field of buddie,
 * we need to place it to original place in list,
 * So we add index property.
 * Runs once.
 */
function saveOriginalBuddiesOrder() {
    const length = buddiesColl.size;

    if (length > 1) {
        [...buddiesColl.values()].forEach(
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
async function getFavouriteUsers(): Promise<FoxUserProfileI[]> {
    const response = await RequestBg
        .api<FaveGetUsersResponse>({code: "return API.fave.getUsers()"});

    const uids = response.items.map(u => u.id);

    const profiles = await Users.getProfilesById(uids);

    return profiles
        .map(user => {

            return {
                ...user,
                isWatched: false,
                isFave   : true,
            }
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
            if (model) {
                model.isWatched = true;
                setLastActivityTime(model)
            }
        });

    sortBuddies();
}

function setLastActivityTime(model: FoxUserProfileI): Promise<void> {
    function handleResponse(response: MessagesLastActivityResponse): void {

        model.online = response.online;
        model.lastActivityTime = response.time * 1000;
    }

    const code = `return API.messages.getLastActivity({user_id: ${ model.id }})`;

    return RequestBg.api<MessagesLastActivityResponse>({ code })
        .then(handleResponse);
}


function buddyComparator(a: FoxUserProfileI, b: FoxUserProfileI): number {
    return (Number(b.isWatched) - Number(a.isWatched)) ||
        (b.lastActivityTime - a.lastActivityTime) ||
        (Number(b.isFave) - Number(a.isFave)) ||
        a.originalIndex - b.originalIndex;
}

function sortBuddies() {
    const temp = [...buddiesColl.values()].sort(buddyComparator);
    buddiesColl.clear();
    temp.forEach(u => buddiesColl.set(u.id, u))
}

function onLongPollUpdate(updates: number[][]) {
    updates.forEach( update => {
        const type = update[0],
            userId = Math.abs(update[1]);

        // 8,-$user_id,0 -- друг $user_id стал онлайн
        // 9,-$user_id,$flags -- друг $user_id стал оффлайн
        // ($flags равен 0, если пользователь покинул сайт (например, нажал выход) и 1,
        // если оффлайн по таймауту (например, статус away))
        if (type === 9 || type === 8) {
            const profile = buddiesColl.get(Number(userId));

            const isChangeToOnline = (type === 8);
            if (profile.isWatched) {
                profile.lastActivityTime = Date.now();

                const rawText = isChangeToOnline ? "is online":"went offline";

                const title = [
                    Users.getName(profile),
                    I18N.getWithGender(rawText, profile.sex)
                ].join(" ");

                VKfoxNotifications.notify({
                    title,
                    image  : profile.photo,
                    type   : NotifType.BUDDIES,
                    noBadge: true,
                    sex    : profile.sex
                });
            }
        }
    });

    sortBuddies();
    publishData();
}
