import {Collection, Model} from "backbone";
import Notifications from "./notifications.bg";
import Mediator from "../mediator/mediator.bg";
import Msg from "../mediator/messages"
import Settings from "./settings"
import PersistentModel from "../persistent-model/persistent-model";
import {Message} from "../../vk/types";
import {NotificationsSettingsI, PopupSetting, SoundSetting} from "./types";
import {Sex} from "../back/users/types";


export class NotificationsSettings extends PersistentModel {

    get enabled(): boolean {
        return super.get("enabled")
    }

    get popups(): PopupSetting {
        return super.get("popups")
    }

    get sound(): SoundSetting {
        return super.get("sound")
    }


    initialize() {
        const self = this;
        let sound;

        PersistentModel.prototype.initialize.apply(this, arguments);

        Mediator.sub(Msg.NotificationsSettingsGet, () => Mediator.pub(Msg.NotificationsSettings, self.toJSON()) );

        Mediator.sub(Msg.NotificationsSettingsPut, (settings: NotificationsSettingsI) => {
            self.set(settings)
        } );

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


export class NotifType {
    static CHAT = "chat";
    static BUDDIES = "buddies";
    static NEWS = "news"
}

class VKNotification extends Model {

    get noBadge(): boolean {
        return super.get("noBadge")
    }

    get message(): string {
        return super.get("message");
    }

    get sex(): Sex {
        return super.get("sex");
    }
}

const defaultSettingsState: NotificationsSettingsI = {
    enabled: true,
    sound: {
        enabled: true,
        volume: 0.5,
        signal: Settings.standart,
        text2Speech: false
    },
    popups: {
        enabled: true,
        showText: true
    }
};


export const notificationsSettings = new NotificationsSettings(defaultSettingsState, {name: 'notificationsSettings'});


export class NotificationQueue extends Collection<VKNotification> {
    model = VKNotification;

    initialize() {
        const self = this;

        this.on('add remove reset', () => {
                Notifications.setBadge(
                    self.filter( model => !model.noBadge)
                        .length
                );
            })
            .on('add', (model: VKNotification) => {
                if (!model.get('noPopup')) Notifications.createPopup(model.toJSON());

                if (!model.get('noSound')) Notifications.playSound(model.message, model.sex);
            });

        Mediator.sub(Msg.AuthUser, () => self.reset());

        // Remove seen updates
        Mediator.sub(Msg.RouterChange, (tab: string) => {
            const type = tab.substr(1);

            if (tab && self.size()) {
                self.remove(self.where({ type }));
            }
        });

        // remove notifications about read messages
        Mediator.sub(Msg.ChatMessageRead, (message: Message) => {
            if (!message.out) {
                self.remove(self.findWhere({ type: NotifType.CHAT }));
            }
        });

        Mediator.sub(Msg.NotificationsQueueGet, () => {
            Mediator.pub(Msg.NotificationsQueue, self.toJSON())
        });

        // Clear badge, when notifications turned off and vice versa
        notificationsSettings.on('change:enabled', (event, enabled: boolean) => {
            Notifications.setBadge(enabled ? self.size() : '', true);
        });

    }
}