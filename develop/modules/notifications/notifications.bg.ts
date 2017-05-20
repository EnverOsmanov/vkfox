"use strict";
import * as _ from "underscore"
import Browser from "../browser/browser.bg"
import Settings from "../notifications/settings"
import {NotificationQueue, notificationsSettings, VKNotificationI} from "./Notification";

let audioInProgress = false;

const notificationQueue = new NotificationQueue();

function getBase64FromImage(url, onSuccess, onError?: any) {
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

const Notifications = {

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
    notify: (data: VKNotificationI) => notificationQueue.add(data),

    createPopup: (function () {
        function createPopup(options, message) {
            getBase64FromImage(options.image, (base64) => {
                try {
                    browser.notifications.create(_.uniqueId(), {
                        type: 'basic',
                        title: options.title,
                        message: message,
                        iconUrl: base64
                    }).then(() => {});
                }
                catch (e) { console.log(e) }
            });
        }

        return (options) => {
            const popups = notificationsSettings.get('popups');

            if (notificationsSettings.get('enabled') && popups.enabled) {
                createPopup(options, (popups.showText && options.message) || '');
            }
        };
    })(),
    playSound: (function () {
        function play(source, volume) {

            if (!audioInProgress) {
                audioInProgress = true;

                const audio = new Audio(source);
                audio.volume = volume;
                audio.play();
                audio.addEventListener('ended', () => { audioInProgress = false });
            }
        }

        return () => {
            const sound = notificationsSettings.get('sound');

            if (notificationsSettings.get('enabled') && sound.enabled) {
                play(Settings[sound.signal], sound.volume);
            }
        };
    })(),
    setBadge: function (count, force?: boolean) {
        if (notificationsSettings.get('enabled') || force) {
            Browser.setBadgeText(count || '');
        }
    }
};

export default Notifications
