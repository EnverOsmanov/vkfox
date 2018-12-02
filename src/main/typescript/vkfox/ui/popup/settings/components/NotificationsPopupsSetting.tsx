import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import Checkbox from "../../checkbox/Checkbox";
import {NotificationsSettingsI} from "../../../../common/notifications/types";

interface Props {
    notifications: NotificationsSettingsI

    onNotificationsPopupToggle(filterName: string, filterValue: boolean)
}

class NotificationsPopupsSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onNotificationsPopupToggle} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <i className="settings__icon fa fa-bell" />

                <label className="settings__label">
                    {I18N.get("popups")}
                </label>

                <Checkbox
                    className="settings__checkbox"
                    isDisabled={!notifications.enabled}
                    isChecked={notifications.popups.enabled}
                    filterName="enabled"
                    onToggle={onNotificationsPopupToggle}
                />
            </div>
        );
    }
}

export default NotificationsPopupsSetting;