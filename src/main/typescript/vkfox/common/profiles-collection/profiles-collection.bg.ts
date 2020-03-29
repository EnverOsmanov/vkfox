"use strict";
import Mediator from '../../mediator/mediator.bg'
import {AddOptions, Collection, Model, Silenceable} from "backbone";
import {Msg} from "../../mediator/messages";
import {UserProfile} from "../users/types";


const UPDATE_NON_FRIENDS_PERIOD = 10000;


export abstract class GProfile extends Model {}




export default class GProfileColl<P extends GProfile> extends Collection<P> {
    initialize() {
        this.subscribeForLpUpdates();

/*        this._updateNonFriends = _.debounce(
            this._updateNonFriends.bind(this),
            UPDATE_NON_FRIENDS_PERIOD
        );
        this._updateNonFriends();*/
    }

/*    _updateNonFriends() {
        const self = this;

        const uids = this.where({
            isFriend: undefined,
            // don't select groups profiles
            gid     : undefined
        }).map( model => model.get('uid') );

        if (uids.length) {
            Users.getProfilesById(uids).then( (profiles) => {
                profiles.forEach( profile => {
                    const model = self.get(profile.uid);
                    console.debug("NonFrined", model, self.find(p => (p as any).uid === profile.uid));

                    if (model) model.set('online', profile.online);
                });
            }).then(this._updateNonFriends.bind(this));
        }
        else this._updateNonFriends();
    }*/

    subscribeForLpUpdates(): void {
        Mediator.sub(
            Msg.LongpollUpdates,
            (updates: number[][]) => GProfileCollCmpn._onFriendUpdates(this, updates)
        );
    }

}

export class GProfileCollCmpn {

    /**
     * @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server

     */
    static _onFriendUpdates<P extends GProfile>(self: Collection<P>, updates: number[][]): void {

        updates.forEach( update => {
            const type = update[0],
                userId = Math.abs(update[1]);

            // 8,-$user_id,0 -- друг $user_id стал онлайн
            // 9,-$user_id,$flags -- друг $user_id стал оффлайн
            // ($flags равен 0, если пользователь покинул сайт (например, нажал выход) и 1,
            // если оффлайн по таймауту (например, статус away))
            if (type === 9 || type === 8) {
                const model = self.get(Number(userId));

                if (model) model.set('online', Number(type === 8));
            }
        });
    }

    private static _onUserUpdates<P extends UserProfile>(self: Map<number, P>, updates: number[][]): void {

        updates.forEach( update => {
            const type = update[0],
                userId = Math.abs(update[1]);

            // 8,-$user_id,0 -- друг $user_id стал онлайн
            // 9,-$user_id,$flags -- друг $user_id стал оффлайн
            // ($flags равен 0, если пользователь покинул сайт (например, нажал выход) и 1,
            // если оффлайн по таймауту (например, статус away))
            if (type === 9 || type === 8) {
                const model = self.get(Number(userId));

                if (model) model.online = (type === 8) ? 1 : 0;
            }
        });
    }

    static subscribeForLpUpdates<P extends UserProfile>(users: Map<number, P>): void {
        Mediator.sub(
            Msg.LongpollUpdates,
            (updates: number[][]) => GProfileCollCmpn._onUserUpdates(users, updates)
        );
    }
}


class ProfilesAddOptions implements AddOptions {
    parse = true;

    merge = false;
}

class SilentAddOptions implements Silenceable {
    silent = true
}

export class BBCollectionOps {
    static beSilentOptions = new SilentAddOptions();
    static addOptions = new ProfilesAddOptions()
}
