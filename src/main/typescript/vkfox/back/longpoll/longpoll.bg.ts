"use strict";
import RequestBg from "../request/request.bg";
import Mediator from "../../mediator/mediator.bg";
import {Msg} from "../../mediator/messages";
import {AccessTokenError, LongPollKeyError} from "../request/models";
import {LongPollRS, LongPollServerRS} from "../../../vk/types";

const LONG_POLL_WAIT = 25,
    DEBOUNCE_RATE    = 1000;

function wait() {
    return new Promise( (resolve) => setTimeout(resolve, DEBOUNCE_RATE))
}

function fetchUpdates(serverRS: LongPollServerRS) {
    //console.debug("StartLP", serverRS)
    const params = {
        version: 3,
        act : 'a_check',
        key : serverRS.key,
        ts  : serverRS.ts,
        wait: LONG_POLL_WAIT,
        mode: 2
    };

    function handleSuccess(response: LongPollRS): Promise<any> {

        if (response.failed && response.failed == 2){
            //console.debug("Failed", response, serverRS);
            return enableLongPollUpdates(serverRS.ts);
        }
        else if (response.updates && response.updates.length) {
            //console.debug("LP successOld", serverRS.ts);
            //console.debug("LP successNew", response.ts);
            //console.debug("LP successFull", response);
            Mediator.pub(Msg.LongpollUpdates, response.updates);

            serverRS.ts = response.ts;
            return Promise.resolve();
        }
        else {
            //console.debug("LP nothing", response);
            if (response.ts) serverRS.ts = response.ts;
            return Promise.resolve();
        }
    }

    return RequestBg
        .get(`https://${serverRS.server}`, params, "json")
        .then(handleSuccess)
        .then(wait)
        .then(() => fetchUpdates(serverRS))
}

export default function enableLongPollUpdates(ts?: string) {
    const obj = {
        lp_version: 3
    }
    return RequestBg
        .api<LongPollServerRS>({ code: `return API.messages.getLongPollServer(${JSON.stringify(obj)});` })
        .then(server => {
            if (ts) server.ts = ts;
            return fetchUpdates(server)
        })
        .catch(handleError)
}

function handleError(e: Error): void {
    if (e instanceof AccessTokenError || e instanceof LongPollKeyError) {
        console.error("LongPoll failed... Retrying", e.message)
    }
    else console.error("LongPoll failed... Retrying", e);

    setTimeout(enableLongPollUpdates, DEBOUNCE_RATE);
}