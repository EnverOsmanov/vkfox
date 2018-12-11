import {ForceOnlineSettingsI, NotificationsSettingsI, PopupSetting, SoundSetting} from "../../../../common/notifications/types";
import VKfoxSignal from "../../../../common/notifications/VKfoxSignal";


const popups: PopupSetting = {
    enabled: true,
    showText: true
};

const sound: SoundSetting = {
    enabled     : true,
    volume      : 0.5,
    signal      : VKfoxSignal.standart,
    text2Speech : false
};

const notifications: NotificationsSettingsI = {
    enabled : true,
    popups,
    sound
};

const forceOnline: ForceOnlineSettingsI = {
    enabled: true
};


export const defaultState = {
    notifications,
    forceOnline
};