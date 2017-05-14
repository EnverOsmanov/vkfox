"use strict";
import Users from '../users/users.bg'
import * as _ from "underscore"
import Mediator from '../mediator/mediator.bg'
import {Model, Collection} from "backbone";


const UPDATE_NON_FRIENDS_PERIOD = 10000;

export default class ProfileColl<P extends Model> extends Collection<P> {
    initialize() {
        Mediator.sub('longpoll:updates', this._onFriendUpdates.bind(this));

        this._updateNonFriends = _.debounce(
            this._updateNonFriends.bind(this),
            UPDATE_NON_FRIENDS_PERIOD
        );
        this._updateNonFriends();
    }

    _updateNonFriends() {
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

                    if (model) model.set('online', profile.online);
                });
            }).then(this._updateNonFriends.bind(this));
        }
        else this._updateNonFriends();
    }

    /**
     * @see http://vk.com/developers.php?oid=-17680044&p=Connecting_to_the_LongPoll_Server
     *
     * @param {Array} updates
     */
    _onFriendUpdates(updates) {
        updates.forEach(function (update) {
            const type = update[0],
                userId = Math.abs(update[1]);

            // 8,-$user_id,0 -- друг $user_id стал онлайн
            // 9,-$user_id,$flags -- друг $user_id стал оффлайн
            // ($flags равен 0, если пользователь покинул сайт (например, нажал выход) и 1,
            // если оффлайн по таймауту (например, статус away))
            if (type === 9 || type === 8) {
                const model = this.get(Number(userId));
                if (model) model.set('online', Number(type === 8));
            }
        }, this);
    }
}
