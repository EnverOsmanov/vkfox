"use strict";
import Request from '../request/request.bg';
import Mediator from "../mediator/mediator.bg"
import PersistentModel from "../persistent-model/persistent-model"


const MARK_PERIOD   = 5 * 60 * 1000; //5 min

let timeoutId;

export default function init() {
    const settings = new PersistentModel({
        enabled: false
    }, {name: 'forceOnline'});

    Mediator.sub('forceOnline:settings:get', function () {
        Mediator.pub('forceOnline:settings', settings.toJSON());
    });

    Mediator.sub('forceOnline:settings:put', function (data) {
        settings.set(data);
    });

    if (settings.get('enabled')) markAsOnline();

    settings.on('change:enabled', function (event, enabled) {
        if (enabled) markAsOnline();
        else clearTimeout(timeoutId);
    });
}

function markAsOnline() {
    clearTimeout(timeoutId);
    Request.api({code: 'return API.account.setOnline();'});
    timeoutId = setTimeout(markAsOnline, MARK_PERIOD);
}
