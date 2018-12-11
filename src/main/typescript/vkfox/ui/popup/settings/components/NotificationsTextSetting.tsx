import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import Checkbox from "../../components/checkbox/Checkbox";
import {NotificationsSettingsI} from "../../../../common/notifications/types";

interface Props {
    notifications: NotificationsSettingsI

    onNotificationsPopupToggle(filterName: string, filterValue: boolean)
}

class NotificationsTextSetting extends React.Component<Props, object> {

    render() {
        const {notifications, onNotificationsPopupToggle} = this.props;

        return (
            <div className="settings__row settings__row_sub">
                <label className="settings__label">
                    {I18N.get("show text")}
                </label>
                <Checkbox
                    className="settings__checkbox"
                    isDisabled={!notifications.enabled || !notifications.popups.enabled}
                    isChecked={notifications.popups.showText}
                    filterName="showText"
                    onToggle={onNotificationsPopupToggle}
                />
            </div>
        );
    }
}

export default NotificationsTextSetting;