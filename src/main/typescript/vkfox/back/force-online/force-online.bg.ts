"use strict";
import RequestBg from '../request/request.bg';
import Mediator from "../../mediator/mediator.bg"
import PersistentModel from "../../common/persistent-model/persistent-model"
import {Msg} from "../../mediator/messages";
import {ForceOnlineSettingsI} from "../../common/notifications/types";


const MARK_PERIOD   = 30 * 1000; //5 min

let timeoutId: number;

const settings = new PersistentModel(
    {enabled: false },
    {name: 'forceOnline'}
    );

export default function init() {


    Mediator.sub(Msg.ForceOnlineSettingsGet, () => Mediator.pub(Msg.ForceOnlineSettings, settings.toJSON()) );

    Mediator.sub(
        Msg.ForceOnlineSettingsPut,
        (foSets: ForceOnlineSettingsI) => settings.set(foSets)
    );

    markAsOfflineIfModeOn();

    settings.on('change:enabled',  (event, enabled: boolean) => {
        if (enabled) clearTimeout(timeoutId);
        else markAsOffline();
    });
}

function markAsOffline(): Promise<number> {
    clearTimeout(timeoutId);

    return RequestBg.api<number>({code: 'return API.account.setOffline();'})
        .then(() => timeoutId = window.setTimeout(markAsOffline, MARK_PERIOD))
}

export function markAsOfflineIfModeOn(): Promise<number | void> {
    // forceOnline not enabled
    if (!settings.get('enabled'))
        return markAsOffline();
    else
        return Promise.resolve()
}
