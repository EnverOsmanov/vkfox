import * as React from "react"
import Mediator from "../../mediator/mediator.pu"
import Msg from "../../mediator/messages"
import I18N from "../../i18n/i18n";
import Settings from "../../notifications/settings"
import {ForceOnlineSettingsI, NotificationsSettingsI, SoundSetting} from "../../notifications/Notification";
import Checkbox from "../checkbox/Checkbox";
import VKfoxAudio from "../../notifications/VKfoxAudio";



interface SettingsState {
    notifications: NotificationsSettingsI
    forceOnline: ForceOnlineSettingsI
}


class SettingsPage extends React.Component<undefined, SettingsState> {


    constructor(props) {
        super(props);

        const popupSettings = {
            enabled: true,
            showText: true
        };

        const soundSettings = {
            enabled : true,
            volume  : 0.5,
            signal  : Settings.standart
        };

        const notifications: NotificationsSettingsI = {
            enabled : true,
            popups   : popupSettings,
            sound   : soundSettings
        };

        const forceOnline = {
            enabled: true
        };

        this.state = {
            notifications,
            forceOnline
        };
    }

    componentWillMount() {
        Mediator.sub(Msg.ForceOnlineSettings, this.onForceOnlineSettings);
        Mediator.sub(Msg.NotificationsSettings, this.onNotificationsSettings);

        Mediator.pub(Msg.ForceOnlineSettingsGet);
        Mediator.pub(Msg.NotificationsSettingsGet);
    }

    componentWillUnmount() {
        Mediator.unsub(Msg.ForceOnlineSettings);
        Mediator.unsub(Msg.NotificationsSettings);
    }

    onForceOnlineSettings = (settings: ForceOnlineSettingsI) => {
        this.setState(prevState => {

            return {
                ...prevState,
                forceOnline: settings
            }
        })
    };

    onNotificationsSettings = (notifications: NotificationsSettingsI) => {

        this.setState(prevState => {

            return {
                ...prevState,
                notifications
            }
        })
    };

    onForceOnlineToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {

            const forceOnline = {
                ...prevState.forceOnline
            };
            forceOnline[filterName] = filterValue;


            Mediator.pub(Msg.ForceOnlineSettingsPut, forceOnline);

            return {
                ...prevState,
                forceOnline
            }
        })
    };

    onNotificationsToggle = (filterName: string, filterValue: boolean) => {

        this.setState(prevState => {

            const notifications = {
                ...prevState.notifications
            };
            notifications[filterName] = filterValue;


            Mediator.pub(Msg.NotificationsSettingsPut, notifications);

            return {
                ...prevState,
                notifications
            }
        })
    };

    onNotificationsSoundToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {


            const sound = {
                ...prevState.notifications.sound
            };
            sound[filterName] = filterValue;

            const notifications = {
                ...prevState.notifications,
                sound
            };

            return {
                ...prevState,
                notifications
            }
        })
    };

    onNotificationsPopupToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {


            const popups = {
                ...prevState.notifications.popups
            };
            popups[filterName] = filterValue;

            const notifications = {
                ...prevState.notifications,
                popups
            };

            return {
                ...prevState,
                notifications
            }
        })
    };

    signalOptions = () => {
        return Object.keys(Settings).map( signal => {
            return (
                <option key={signal} value={signal}>{signal}</option>
            )
        })
    };

    onSoundChange = (event) => {

        const signal = event.target.value;
        this.setState(prevState => {

            const sound: SoundSetting = {
                ...prevState.notifications.sound,
                signal
            };

            const notifications: NotificationsSettingsI = {
                ...prevState.notifications,
                sound
            };

            VKfoxAudio.play(sound);

            Mediator.pub(Msg.NotificationsSettingsPut, notifications);

            return {
                ...prevState,
                notifications
            }
        })
    };

    onVolumeChange = (event) => {

        const volume = event.target.value;
        this.setState(prevState => {

            const sound: SoundSetting = {
                ...prevState.notifications.sound,
                volume
            };

            const notifications: NotificationsSettingsI = {
                ...prevState.notifications,
                sound
            };


            VKfoxAudio.play(sound);
            Mediator.pub(Msg.NotificationsSettingsPut, notifications);

            return {
                ...prevState,
                notifications
            }
        })
    };


    render() {
        const notifications = this.state.notifications;

        return (
            <form
                hidden={!notifications}
                className="settings">

                <div className="settings__row">
                    <i className="fa fa-eye settings__icon" />

                    <label className="settings__label">
                        {I18N.get("force online")}
                    </label>

                    <Checkbox
                        className="settings__checkbox"
                        isChecked={this.state.forceOnline.enabled}
                        filterName="enabled"
                        onToggle={this.onForceOnlineToggle}
                    />
                </div>

                <div className="settings__row settings__separator">
                    <i className="fa fa-bullhorn settings__icon" />

                    <label className="settings__label">
                        {I18N.get("notifications")}
                    </label>

                    <Checkbox
                        className="settings__checkbox"
                        isChecked={notifications.enabled}
                        filterName="enabled"
                        onToggle={this.onNotificationsToggle}
                    />
                </div>

                <div className="settings__row settings__row_sub">
                    <i className="fa fa-volume-up settings__icon" />

                    <label className="settings__label">
                        {I18N.get("sound")}
                    </label>

                    <Checkbox
                        className="settings__checkbox"
                        isChecked={notifications.sound.enabled}
                        filterName="enabled"
                        onToggle={this.onNotificationsSoundToggle}
                    />
                </div>

                <div className="settings__row settings__row_sub">
                    <label className="settings__label">
                        {I18N.get("signal")}
                    </label>

                    <select
                        className="settings__checkbox"
                        disabled={!(notifications.enabled || notifications.sound.enabled)}
                        value={notifications.sound.signal}
                        onChange={this.onSoundChange}>
                        {this.signalOptions()}
                    </select>
                </div>

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
                        onChange={this.onVolumeChange}
                    />
                </div>

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
                        onToggle={this.onNotificationsPopupToggle}
                    />
                </div>


                <div className="settings__row settings__row_sub">
                    <label className="settings__label">
                        {I18N.get("show text")}
                        </label>
                    <Checkbox
                        className="settings__checkbox"
                        isDisabled={!notifications.enabled || !notifications.popups.enabled}
                        isChecked={notifications.popups.showText}
                        filterName="showText"
                        onToggle={this.onNotificationsPopupToggle}
                    />
                </div>

            </form>
        );
    }
}

export default SettingsPage