"use strict";
import PersistentModel from '../../../common/persistent-model/persistent-model'
import {profile2Name} from "../components/filters/filters.pu";
import {BuddiesFilters} from "./types";
import {UserProfile} from "../../../common/users/types";
import {FoxUserProfileI} from "../../../common/chat/types";


/**
 * Says if profile matched search clue.
 * Uses lowercasing of arguments
 *
 * @param {Object} profile
 * @param {String} searchClue
 *
 * @returns [Boolean]
 */
export function matchProfile(profile: UserProfile, searchClue: string): boolean {
    return profile2Name(profile)
        .toLowerCase()
        .indexOf(searchClue.toLowerCase()) !== -1;
}


export function buddiesFilter(input: FoxUserProfileI[], filters: BuddiesFilters, searchClue: string): FoxUserProfileI[] {

    return input.filter( (profile) => {
        if (searchClue) {
            return matchProfile(profile, searchClue);
        }
        else {
            return profile.isWatched || (
                (filters.offline || profile.online)
                // if "male" is checked, then proceed,
                // otherwise the profile should be a male
                && ((filters.male || profile.sex !== 2) && (filters.female || profile.sex !== 1))
                && (filters.faves || !profile.isFave)
            );
        }
    });
}


export function initBuddiesFilter() {
    return new PersistentModel({
        male   : true,
        female : true,
        offline: false,
        faves  : true
    }, {name: 'buddiesFilters'})
}
