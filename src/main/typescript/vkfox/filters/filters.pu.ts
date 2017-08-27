"use strict";
import * as moment from "moment";
import * as Config from '../config/config';


export function duration() {
    /**
     * Returns time duration in format 'HH:mm'
     *
     * @param {Array} seconds
     *
     * @returns {String}
     */
    return (seconds) => {
        if (seconds) return moment.unix(seconds).format('HH:mm');
    };
}

export function object2Name() {
    /**
     * Returns names from profile's data
     *
     * @param {Object|Array} input
     *
     * @returns {String} String
     */
    return (input) => {
        function owner2Name(owner) {
            //group profile
            //user profile
            return owner.name
                ? owner.name
                : `${owner.first_name} ${owner.last_name}`;
        }

        if (input) {
            return [].concat(input).map(owner2Name).join(', ');
        }
    };
}

export function timeAgo() {
    return (timestamp: number) => {
        if (timestamp) return moment(timestamp).fromNow();
    };
}

export function addVKBase() {
    return (path: string) => {
        if (path.indexOf(Config.VK_BASE) === -1) {
            if (path.charAt(0) === '/') path = path.substr(1);

            return Config.VK_BASE + path;
        }
        else return path;
    };
}

export function Capitalize() {
    /**
     * Returns capitalized text
     *
     * @param {String} seconds
     *
     * @returns {String}
     */
    return function (str) {
        if (str && str.length) return str[0].toUpperCase() + str.substr(1);
    };
}
