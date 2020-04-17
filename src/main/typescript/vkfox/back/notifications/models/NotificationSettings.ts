import PersistentModel from "../../../common/persistent-model/persistent-model";
import {NotificationsSettingsI, PopupSetting, SoundSetting} from "../../../common/notifications/types";
import Mediator from "../../../mediator/mediator.bg";
import {Msg} from "../../../mediator/messages";


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

        Mediator.sub(Msg.NotificationsSettingsGet, () => Mediator.pub(Msg.NotificationsSettings, self.toJSON()));

        Mediator.sub(Msg.NotificationsSettingsPut, (settings: NotificationsSettingsI) => {
            self.set(settings)
        });

        // TODO remove in v5.0.7
        // support legacy signal values (i.g. standart.mp3)
        sound = self.get('sound');
        ['standart', 'original'].some( type => {
            if (sound.signal.indexOf(type) > 0) {
                sound.signal = type;
                return true;
            }
        });
    }
}