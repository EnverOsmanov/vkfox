import {ForceOnlineSettingsI, NotificationsSettingsI, PopupSetting, SoundSetting} from "../../../notifications/types";
import Settings from "../../../notifications/settings";


const popups: PopupSetting = {
    enabled: true,
    showText: true
};

const sound: SoundSetting = {
    enabled     : true,
    volume      : 0.5,
    signal      : Settings.standart,
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