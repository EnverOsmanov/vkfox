"use strict";
const LONG_POLL_WAIT = 20,
    DEBOUNCE_RATE    = 1000,
    _                = require('../shim/underscore.js')._,
    Request          = require('../request/request.bg.js'),
    Mediator         = require('../mediator/mediator.js');

let fetchUpdates;
const enableLongPollUpdates = _.debounce(function () {
    Request.api({
        code: 'return API.messages.getLongPollServer();'
    }).then(fetchUpdates, enableLongPollUpdates).done();
}, DEBOUNCE_RATE);

fetchUpdates = _.debounce(function (params) {
    Request.
    get('http://' + params.server, {
        act : 'a_check',
        key : params.key,
        ts  : params.ts,
        wait: LONG_POLL_WAIT,
        mode: 2
    }, 'json').
    then(function (response) {
        if (!response.updates) {
            enableLongPollUpdates();
            return;
        } else if (response.updates.length) {
            Mediator.pub('longpoll:updates', response.updates);
        }

        params.ts = response.ts;
        fetchUpdates(params);
    }, enableLongPollUpdates).
    done();
}, DEBOUNCE_RATE);

Mediator.sub('auth:success', function () {
    enableLongPollUpdates();
});
