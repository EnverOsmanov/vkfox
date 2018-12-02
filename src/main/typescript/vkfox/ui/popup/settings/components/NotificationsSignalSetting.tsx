import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import {NotificationsSettingsI} from "../../../../common/notifications/types";
import Settings from "../../../../back/notifications/VKfoxSignal";

interface Props {
    notifications: NotificationsSettingsI

    onSoundChange(event: React.ChangeEvent<HTMLSelectElement>)
}

class NotificationsSignalSetting extends React.Component<Props, object> {

    signalOptions = () => {
        return Object.keys(Settings).map( signal => {
            return (
                <option key={signal} value={signal}>{signal}</option>
            )
        })
    };

    render() {
        const {notifications, onSoundChange} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <label className="settings__label">
                    {I18N.get("signal")}
                </label>

                <select
                    className="settings__checkbox"
                    disabled={!(notifications.enabled || notifications.sound.enabled)}
                    value={notifications.sound.signal}
                    onChange={onSoundChange}>
                    {this.signalOptions()}
                </select>
            </div>
        );
    }
}

export default NotificationsSignalSetting;