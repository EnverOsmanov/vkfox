"use strict";
import * as _ from "underscore"
import Browser from "../browser/browser.bg"
import {NotifType, VKNotification} from "./VKNotification";
import {NotificationsSettingsI, VKNotificationI} from "../../common/notifications/types";
import VKfoxAudio from "../../common/notifications/VKfoxAudio";
import {html2text} from "../../rectify/helpers";
import NotificationOptions = browser.notifications.NotificationOptions;
import {NotificationQueue} from "./models/NotificationQueue";
import {NotificationsSettings} from "./models/NotificationSettings";
import VKfoxSignal from "../../common/notifications/VKfoxSignal";


const defaultSettingsState: NotificationsSettingsI = {
    enabled: true,
    sound: {
        enabled: true,
        volume: 0.5,
        signal: VKfoxSignal.standart,
        text2Speech: false
    },
    popups: {
        enabled: true,
        showText: true
    }
};

const notificationsSettings: NotificationsSettings =
    new NotificationsSettings(defaultSettingsState, {name: 'notificationsSettings'});
const notificationQueue = new NotificationQueue();


function getBase64FromImage(url: string, onSuccess: (string) => any, onError?: any) {
    const xhr = new XMLHttpRequest();

    xhr.responseType = "arraybuffer";
    xhr.open("GET", url);

    xhr.onload = function () {

        const bytes = new Uint8Array(xhr.response);
        //NOTE String.fromCharCode.apply(String, ...
        //may cause "Maximum call stack size exceeded"
        const binary = [].map.call(bytes, function (byte) {
            return String.fromCharCode(byte);
        }).join('');

        const mediaType = xhr.getResponseHeader('content-type');
        const base64 = [
            'data:',
            mediaType ? mediaType + ';':'',
            'base64,',
            btoa(binary)
        ].join('');
        onSuccess(base64);
    };
    xhr.onerror = onError;
    xhr.send();
}

function isChat(noti: VKNotificationI): boolean {
    return noti.type === NotifType.CHAT
}

export default class Notifications {

    static init() {

        // Clear badge, when notifications turned off and vice versa
        notificationsSettings.on('change:enabled', (event, enabled: boolean) => {
            const count = enabled
                ? notificationQueue.size()
                : '';

            Notifications.setBadge(count, true);
        });
    }

    /**
     * Create notifications. Usually you will need only this method
     *
     */
    static notify(notification: VKNotificationI): VKNotification {
        return notificationQueue.add(notification)
    }

    static createPopup(options: VKNotificationI): void {
        function createP(base64: string): Promise<string | void> {
            const message = (popups.showText && options.message) || '';

            const notificationOptions: NotificationOptions = {
                type   : "basic",
                title  : options.title,
                iconUrl: base64,
                message: html2text(message)
            };

            return browser.notifications
                .create(_.uniqueId(), notificationOptions)
                .catch(e => console.error("Failed to create notification", e));
        }

        const {popups} = notificationsSettings;

        if (notificationsSettings.enabled && popups.enabled) {
            getBase64FromImage(options.image, createP);
        }

    }

    static playSound(noti: VKNotificationI): void {

        const {sound} = notificationsSettings;

        if (notificationsSettings.enabled && sound.enabled) {
            if (isChat(noti) && sound.text2Speech && !!noti.message) VKfoxAudio.readTextInVoice(noti.message, noti.sex);
            else VKfoxAudio.play(sound);
        }
    }

    static setBadge(count, force?: boolean) {
        if (notificationsSettings.enabled || force) {
            Browser.setBadgeText(count || '');
        }
    }
};
