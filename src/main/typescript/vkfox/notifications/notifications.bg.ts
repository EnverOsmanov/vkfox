"use strict";
import * as _ from "underscore"
import Browser from "../browser/browser.bg"
import {NotificationQueue, notificationsSettings, VKNotificationI} from "./Notification";
import VKfoxAudio from "./VKfoxAudio";
import NotificationOptions = browser.notifications.NotificationOptions;
import {html2text} from "../rectify/helpers";


const notificationQueue = new NotificationQueue();

function getBase64FromImage(url: string, onSuccess: (string) => any, onError?: any) {
    const xhr = new XMLHttpRequest();

    xhr.responseType = "arraybuffer";
    xhr.open("GET", url);

    xhr.onload = function () {
console.debug("ONLOAD");
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

export default class Notifications {

    /**
     * Create notifications. Usually you will need only this method
     *
     */
    static notify(notification: VKNotificationI) {
        return notificationQueue.add(notification)
    }

    static createPopup(options: VKNotificationI) {
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

        const popups = notificationsSettings.popups;

        if (notificationsSettings.enabled && popups.enabled) {
            getBase64FromImage(options.image, createP);
        }

    }

    static playSound(): void {

        const sound = notificationsSettings.sound;

        if (notificationsSettings.enabled && sound.enabled) {
            VKfoxAudio.play(sound);
        }
    }

    static setBadge(count, force?: boolean) {
        if (notificationsSettings.enabled || force) {
            Browser.setBadgeText(count || '');
        }
    }
};
