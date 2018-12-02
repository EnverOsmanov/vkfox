import * as React from 'react';
import I18N from "../../../../common/i18n/i18n";
import Checkbox from "../../checkbox/Checkbox";
import {ForceOnlineSettingsI} from "../../../../common/notifications/types";


interface Props {
    forceOnline: ForceOnlineSettingsI

    onForceOnlineToggle(filterName: string, filterValue: boolean)
}

class ForceOnlineSetting extends React.Component<Props, object> {

    render() {
        return (
            <div className="settings__row">
                <i className="fa fa-eye settings__icon" />

                <label className="settings__label">
                    {I18N.get("force online")}
                </label>

                <Checkbox
                    className="settings__checkbox"
                    isChecked={this.props.forceOnline.enabled}
                    filterName="enabled"
                    onToggle={this.props.onForceOnlineToggle}
                />
            </div>
        );
    }
}

export default ForceOnlineSetting;