import {NotifType} from "../../back/notifications/VKNotification";
import {Sex} from "../../back/users/types";

export interface PopupSetting {
    enabled : boolean;
    showText: boolean
}

export interface SoundSetting {
    enabled     : boolean;
    volume      : number;
    signal      : string
    text2Speech : boolean
}

export interface ForceOnlineSettingsI {
    enabled: boolean
}

export interface NotificationsSettingsI {
    enabled : boolean
    popups  : PopupSetting
    sound   : SoundSetting
}


export interface VKNotificationI {
    type    : NotifType;
    title   : string;
    image   : string;
    noBadge : boolean;
    message?: string;
    noPopup?: boolean
    sex     : Sex
}
