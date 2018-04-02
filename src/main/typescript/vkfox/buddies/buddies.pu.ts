"use strict";
import Mediator from '../mediator/mediator.pu'
import PersistentModel from '../persistent-model/persistent-model'
import Msg from "../mediator/messages"
import {ProfileI} from "../chat/collections/ProfilesColl";
import {profile2Name} from "../popup/filters/filters.pu";


/**
 * Says if profile matched search clue.
 * Uses lowercasing of arguments
 *
 * @param {Object} profile
 * @param {String} searchClue
 *
 * @returns [Boolean]
 */
export function matchProfile(profile: ProfileI, searchClue): boolean {
    return profile2Name(profile)
        .toLowerCase()
        .indexOf(searchClue.toLowerCase()) !== -1;
}



export function buddiesFilter() {

    /**
     * @param [Array] input profiles array
     * @param [Object] filters Filtering rules
     * @param [Boolean] filters.male If false, no man will be returned
     * @param [Boolean] filter.female
     * @param [Boolean] filters.offline
     * @param [Number] count Maximum number filtered results
     * @param [String] searchClue Search clue
     *
     * @returns [Array]
     */
    return function (input: ProfileI[], filters, searchClue: string) {
        if (Array.isArray(input)) {
            return input.filter(function (profile) {
                if (!searchClue) {
                    return profile.isWatched || (
                            (filters.offline || profile.online)
                            // if "male" is checked, then proceed,
                            // otherwise the profile should be a male
                            && ((filters.male || profile.sex !== 2) && (filters.female || profile.sex !== 1))
                            && (filters.faves || !profile.isFave)
                        );
                }
                else return matchProfile(profile, searchClue);
            });
        }
        else return [];
    };
}


export function initBuddiesFilter() {
    return new PersistentModel({
        male   : true,
        female : true,
        offline: false,
        faves  : true
    }, {name: 'buddiesFilters'})
}
