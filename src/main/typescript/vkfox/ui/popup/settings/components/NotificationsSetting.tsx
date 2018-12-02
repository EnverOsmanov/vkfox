import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import Checkbox from "../../checkbox/Checkbox";
import {NotificationsSettingsI} from "../../../../common/notifications/types";


interface Props {
    notifications: NotificationsSettingsI

    onNotificationsToggle(filterName: string, filterValue: boolean)
}

class NotificationsSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onNotificationsToggle} = this.props;

        return (
            <div className="settings__row">
                <i className="fa fa-bullhorn settings__icon" />

                <label className="settings__label">
                    {I18N.get("notifications")}
                </label>

                <Checkbox
                    className="settings__checkbox"
                    isChecked={notifications.enabled}
                    filterName="enabled"
                    onToggle={onNotificationsToggle}
                />
            </div>
        );
    }
}

export default NotificationsSetting;