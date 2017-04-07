"use strict";
const _      = require('underscore')._,
    Request  = require('../request/request.bg.js'),
    Mediator = require('../mediator/mediator.js'),
    Msg      = require("../mediator/messages.js");

const LONG_POLL_WAIT = 20,
    DEBOUNCE_RATE    = 1000;

const fetchUpdates = _.debounce(function (params) {
    const data = {
        act : 'a_check',
        key : params.key,
        ts  : params.ts,
        wait: LONG_POLL_WAIT,
        mode: 2
    };

    function handleSuccess(response) {

        if (!response.updates) {
            enableLongPollUpdates();
            return;
        }
        else if (response.updates.length) {
            Mediator.pub(Msg.LongpollUpdates, response.updates);
        }

        params.ts = response.ts;
        fetchUpdates(params);
    }

    Request
        .get(`https://${params.server}`, data, "json")
        .catch(enableLongPollUpdates)
        .then(handleSuccess);
}, DEBOUNCE_RATE);

Mediator.sub("auth:success", () => enableLongPollUpdates() );

const enableLongPollUpdates = _.debounce( () => {
    const ap = Request
        .api({ code: 'return API.messages.getLongPollServer();' })

        if (!(typeof ap.catch === "function")) {
        console.error("Catch not a function");
        debugger;
        }
        else ap
        .catch(enableLongPollUpdates)
        .then(fetchUpdates);
}, DEBOUNCE_RATE);
