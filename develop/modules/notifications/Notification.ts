import {Collection, Model} from "backbone";
import Notifications from "./notifications.bg";
import Mediator from "../mediator/mediator.bg";
import Msg from "../mediator/messages"
import Settings from "../notifications/settings"
import PersistentModel from "../persistent-model/persistent-model";

class NotificationsSettings extends PersistentModel {
    initialize() {
        const self = this;
        let sound;

        PersistentModel.prototype.initialize.apply(this, arguments);

        Mediator.sub(Msg.NotificationsSettingsGet, () => Mediator.pub(Msg.NotificationsSettings, self.toJSON()) );

        Mediator.sub(Msg.NotificationsSettingsPut, settings => self.set(settings) );

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
}

export const notificationsSettings = new NotificationsSettings({
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
}, {name: 'notificationsSettings'});


export enum NotifType {
    CHAT,
    BUDDIES,
    NEWS,
}

export class VKNotification extends Model{
    type: NotifType;
    title: string;
    image: string;
    noBadge: boolean;
    message: string;
    noPopup: boolean
}

export class NotificationQueue extends Collection<VKNotification> {
    model = VKNotification;

    initialize() {
        const self = this;

        this
            .on('add remove reset', () => {
                Notifications.setBadge(
                    self.filter( model => !model.get('noBadge'))
                        .length
                );
            })
            .on('add', (model: VKNotification) => {
                if (!model.get('noPopup')) {
                    Notifications.createPopup(model.toJSON());
                }
                if (!model.get('noSound')) {
                    Notifications.playSound();
                }
            });

        Mediator.sub(Msg.AuthSuccess, () => self.reset() );

        // Remove seen updates
        Mediator.sub(Msg.RouterChange, function (params) {
            if (params.tab && self.size()) {
                self.remove(self.where({
                    type: params.tab
                }));
            }
        });
        // remove notifications about read messages
        Mediator.sub(Msg.ChatMessageRead, function (message) {
            if (!message.out) {
                self.remove(self.findWhere({
                    type: NotifType.CHAT
                }));
            }
        });
        Mediator.sub(Msg.NotificationsQueueGet, () => Mediator.pub(Msg.NotificationsQueue, self.toJSON()));
        // Clear badge, when notifications turned off and vice versa
        notificationsSettings.on('change:enabled', (event, enabled: boolean) => {
            Notifications.setBadge(enabled ? self.size() : '', true);
        });

    }
}
