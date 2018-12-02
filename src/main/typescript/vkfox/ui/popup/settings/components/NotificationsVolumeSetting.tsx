import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import {NotificationsSettingsI} from "../../../../common/notifications/types";


interface Props {
    notifications: NotificationsSettingsI

    onVolumeChange(event)
}

class NotificationsVolumeSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onVolumeChange} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <label className="settings__label">
                    {I18N.get("volume")}
                </label>

                <input
                    className="settings__input"
                    step="0.1"
                    min="0"
                    max="1"
                    type="range"
                    value={notifications.sound.volume}
                    onChange={onVolumeChange}
                />
            </div>
        );
    }
}

export default NotificationsVolumeSetting;