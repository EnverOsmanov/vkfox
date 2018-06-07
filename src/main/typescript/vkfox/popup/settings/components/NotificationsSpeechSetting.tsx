import * as React from 'react';
import I18N from "../../../i18n/i18n";
import Checkbox from "../../checkbox/Checkbox";
import {NotificationsSettingsI} from "../../../notifications/types";

interface Props {
    notifications: NotificationsSettingsI

    onNotificationsSoundToggle(filterName: string, filterValue: boolean)
}

class NotificationsSpeechSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onNotificationsSoundToggle} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <label className="settings__label">
                    {I18N.get("text2Speech")}
                </label>

                <Checkbox
                    className="settings__checkbox"
                    isChecked={notifications.sound.text2Speech}
                    filterName="text2Speech"
                    onToggle={onNotificationsSoundToggle}
                />
            </div>
        );
    }
}

export default NotificationsSpeechSetting;