"use strict";
import Request from "../request/request.bg";
import Mediator from "../mediator/mediator.bg";
import Msg from "../mediator/messages";
import {LongPollRS, LongPollServerRS} from "./models";

const LONG_POLL_WAIT = 25,
    DEBOUNCE_RATE    = 1000;

function fetchUpdates(serverRS: LongPollServerRS) {
    const params = {
        act : 'a_check',
        key : serverRS.key,
        ts  : serverRS.ts,
        wait: LONG_POLL_WAIT,
        mode: 2
    };

    function handleSuccess(response: LongPollRS) {

        if (response.failed && response.failed == 2){
            return enableLongPollUpdates();
        }

        if (response.updates.length) {
            Mediator.pub(Msg.LongpollUpdates, response.updates);
        }

        serverRS.ts = response.ts;
        setTimeout(() => fetchUpdates(serverRS), DEBOUNCE_RATE);
    }

    return Request
        .get(`https://${serverRS.server}`, params, "json")
        .then(handleSuccess)
        .catch(handleError)
}

function enableLongPollUpdates() {
    Request
        .api({ code: "return API.messages.getLongPollServer();" })
        .catch(handleError)
        .then(fetchUpdates)
}

function handleError(e: Error) {
    console.error("LongPoll failed... Retrying", e);
    setTimeout(enableLongPollUpdates, DEBOUNCE_RATE);
}


export default function init() {
    Mediator.sub(Msg.AuthSuccess, enableLongPollUpdates);
}