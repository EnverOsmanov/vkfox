"use strict";
const _             = require('underscore')._,
    Backbone        = require('backbone'),
    Browser         = require('../browser/browser.bg.js'),
    Mediator        = require('../mediator/mediator.js'),
    Settings        = require('../notifications/settings.js'),
    PersistentModel = require('../persistent-model/persistent-model.js');

let audioInProgress = false, Notifications,

NotificationsSettings = PersistentModel.extend({
    initialize: function () {
        const self = this;
        let sound;

        PersistentModel.prototype.initialize.apply(this, arguments);

        Mediator.sub('notifications:settings:get', function () {
            Mediator.pub('notifications:settings', self.toJSON());
        });
        Mediator.sub('notifications:settings:put', function (settings) {
            self.set(settings);
        });

        // TODO remove in v5.0.7
        // support legacy signal values (i.g. standart.mp3)
        sound = self.get('sound');
        ['standart', 'original'].some(function (type) {
            if (sound.signal.indexOf(type) > 0) {
                sound.signal = type;
                return true;
            }
        });
    }
}),
notificationsSettings = new NotificationsSettings({
    enabled: true,
    sound: {
        enabled: true,
        volume: 0.5,
        signal: Settings.standart
    },
    popups: {
        enabled: true,
        showText: true
    }
}, {name: 'notificationsSettings'}),

notificationQueue = new (Backbone.Collection.extend({
    initialize: function () {
        const self = this;

        this
            .on('add remove reset', function () {
                Notifications.setBadge(self.filter(function (model) {
                    return !model.get('noBadge');
                }).length);
            })
            .on('add', function (model) {
                if (!model.get('noPopup')) {
                    Notifications.createPopup(model.toJSON());
                }
                if (!model.get('noSound')) {
                    Notifications.playSound();
                }
            });

        Mediator.sub('auth:success', function () {
            self.reset();
        });
        // Remove seen updates
        Mediator.sub('router:change', function (params) {
            if (params.tab && self.size()) {
                self.remove(self.where({
                    type: params.tab
                }));
            }
        });
        // remove notifications about read messages
        Mediator.sub('chat:message:read', function (message) {
            if (!message.out) {
                self.remove(self.findWhere({
                    type: Notifications.CHAT
                }));
            }
        });
        Mediator.sub('notifications:queue:get', function () {
            Mediator.pub('notifications:queue', self.toJSON());
        });
        // Clear badge, when notifications turned off and vice versa
        notificationsSettings.on('change:enabled', function (event, enabled) {
            Notifications.setBadge(enabled ? self.size():'', true);
        });

    }
}))();

function getBase64FromImage(url, onSuccess, onError) {
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

module.exports = Notifications = {
    CHAT   : 'chat',
    BUDDIES: 'buddies',
    NEWS   : 'news',
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
    notify: (data) => { notificationQueue.push(data) },
    createPopup: (function () {
        function createPopup(options, message) {
            getBase64FromImage(options.image, (base64) => {
                try {
                    chrome.notifications.create(_.uniqueId(), {
                        type: 'basic',
                        title: options.title,
                        message: message,
                        iconUrl: base64
                    }, function () {});
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
    setBadge: function (count, force) {
        if (notificationsSettings.get('enabled') || force) {
            Browser.setBadgeText(count || '');
        }
    }
};
