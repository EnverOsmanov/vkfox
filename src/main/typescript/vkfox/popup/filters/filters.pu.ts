"use strict";
import * as moment from "moment";
import * as Config from '../../config/config';
import {NameSurname, OnlyName, ProfileI} from "../../chat/collections/ProfilesColl";

/**
 * Returns time duration in format 'HH:mm'
 *
 * @param {Array} seconds
 *
 * @returns {String}
 */
export function duration(seconds: number) {

    if (seconds) return moment.unix(seconds).format('HH:mm');
}

/**
 * Returns names from profile's data
 *
 * @param {Object|Array} input
 *
 * @returns {String} String
 */
export function profile2Name(input: OnlyName | NameSurname | OnlyName[] | NameSurname[]): string {

    function owner2Name(owner: OnlyName | NameSurname) {
        //group profile
        //user profile
        return "name" in owner
            ? owner.name
            : `${owner.first_name} ${owner.last_name}`;
    }

    if (input) {
        return [].concat(input).map(owner2Name).join(', ');
    }
}

export function timeAgo(timestamp: number) {
    if (timestamp)
        return moment(timestamp).fromNow();
}

export function addVKBase(path: string) {
    if (path.indexOf(Config.VK_BASE) === -1) {
        if (path.charAt(0) === '/') path = path.substr(1);

        return Config.VK_BASE + path;
    }
    else return path;
}

export function Capitalize(str: string): string {
    /**
     * Returns capitalized text
     *
     * @param {String} seconds
     *
     * @returns {String}
     */

    if (str && str.length)
        return str[0].toUpperCase() + str.substr(1);
}
