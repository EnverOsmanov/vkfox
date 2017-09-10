"use strict";
import * as _ from "underscore"
import Browser from "../browser/browser.bg"
import Settings from "./settings"
import {NotificationQueue, notificationsSettings, VKNotificationI} from "./Notification";
import NotificationOptions = browser.notifications.NotificationOptions;
import VKfoxAudio from "./VKfoxAudio";


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

export default class Notifications {

    /**
     * Create notifications. Usually you will need only this method
     *
     * @param {Object} data
     * @param {String} data.type
     * @param {String} data.title
     * @param {String} data.message
     * @param {String} data.image
     * @param {Boolean} [data.noBadge]
     * @param {Boolean} [data.noPopup]
     */
    static notify(data: VKNotificationI) {
        return notificationQueue.add(data)
    }

    static createPopup(options: VKNotificationI) {
        function createP(base64: string) {
            const message = (popups.showText && options.message) || '';

            const notificationOptions: NotificationOptions = {
                type   : "basic",
                title  : options.title,
                message: message,
                iconUrl: base64
            };

            return browser.notifications.create(_.uniqueId(), notificationOptions)
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
