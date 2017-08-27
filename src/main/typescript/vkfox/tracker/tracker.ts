"use strict";

export default {

    /**
     * Remote debug. All arguments would be send to Analytics.
     *
     * @param {Array} args Any number of arguments,
     * that will be sent to Analytics
     */
    debug: function (...args: any[]) {

        console.debug(args)
    },
    /**
     * Remotely Tracker an error
     *
     * @param {Error} stack
     */
    error: function (stack) {
        console.error(stack)
    }
};
