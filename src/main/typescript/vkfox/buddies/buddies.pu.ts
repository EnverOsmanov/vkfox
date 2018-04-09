"use strict";
import PersistentModel from '../persistent-model/persistent-model'
import {ProfileI} from "../chat/types";
import {profile2Name} from "../popup/filters/filters.pu";
import {BuddiesFilters} from "./types";


/**
 * Says if profile matched search clue.
 * Uses lowercasing of arguments
 *
 * @param {Object} profile
 * @param {String} searchClue
 *
 * @returns [Boolean]
 */
export function matchProfile(profile: ProfileI, searchClue: string): boolean {
    return profile2Name(profile)
        .toLowerCase()
        .indexOf(searchClue.toLowerCase()) !== -1;
}


export function buddiesFilter(input: ProfileI[], filters: BuddiesFilters, searchClue: string): ProfileI[] {

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
