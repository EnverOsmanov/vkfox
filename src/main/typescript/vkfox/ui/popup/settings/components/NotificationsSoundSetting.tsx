import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import Checkbox from "../../checkbox/Checkbox";
import {NotificationsSettingsI} from "../../../../common/notifications/types";


interface Props {
    notifications: NotificationsSettingsI

    onNotificationsSoundToggle(filterName: string, filterValue: boolean)
}

class NotificationsSoundSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onNotificationsSoundToggle} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <i className="fa fa-volume-up settings__icon" />

                <label className="settings__label">
                    {I18N.get("sound")}
                </label>

                <Checkbox
                    className="settings__checkbox"
                    isChecked={notifications.sound.enabled}
                    filterName="enabled"
                    onToggle={onNotificationsSoundToggle}
                />
            </div>
        );
    }
}

export default NotificationsSoundSetting;