import * as React from "react"
import iassign from "immutable-assign";
import Mediator from "../../../mediator/mediator.pu"
import {Msg} from "../../../mediator/messages"
import {ForceOnlineSettingsI, NotificationsSettingsI} from "../../../notifications/types";
import VKfoxAudio from "../../../notifications/VKfoxAudio";
import ForceOnlineSetting from "./components/ForceOnlineSetting";
import NotificationsSetting from "./components/NotificationsSetting";
import NotificationsSoundSetting from "./components/NotificationsSoundSetting";
import NotificationsSignalSetting from "./components/NotificationsSignalSetting";
import NotificationsVolumeSetting from "./components/NotificationsVolumeSetting";
import NotificationsPopupsSetting from "./components/NotificationsPopupsSetting";
import NotificationsTextSetting from "./components/NotificationsTextSetting";
import {defaultState} from "./helper/SettingsPageHelper";
import NotificationsSpeechSetting from "./components/NotificationsSpeechSetting";


interface SettingsState {
    notifications: NotificationsSettingsI
    forceOnline: ForceOnlineSettingsI
}


class SettingsPage extends React.Component<object, SettingsState> {

    public readonly state = defaultState;


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

    onForceOnlineSettings = (forceOnline: ForceOnlineSettingsI) => {
        this.setState(prevState => {

            return {
                ...prevState,
                forceOnline
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

    ///////////////

    onForceOnlineToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {

            const newState: SettingsState = iassign(prevState,
                s => s.forceOnline[filterName],
                () => filterValue
            );

            Mediator.pub(Msg.ForceOnlineSettingsPut, newState.forceOnline);

            return newState;
        })
    };

    onNotificationsToggle = (filterName: string, filterValue: boolean) => {

        this.setState(prevState => {

            const newState: SettingsState = iassign(prevState,
                s => s.notifications[filterName],
                () => filterValue
            );

            Mediator.pub(Msg.NotificationsSettingsPut, newState.notifications);

            return newState
        })
    };

    onNotificationsSoundToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {

            const newState: SettingsState = iassign(prevState,
                s => s.notifications.sound[filterName],
                () => filterValue
            );

            Mediator.pub(Msg.NotificationsSettingsPut, newState.notifications);

            return newState
        })
    };

    onNotificationsPopupToggle = (filterName: string, filterValue: boolean) => {
        this.setState(prevState => {
            const newState: SettingsState = iassign(prevState,
                s => s.notifications.popups[filterName],
                () => filterValue
            );

            Mediator.pub(Msg.NotificationsSettingsPut, newState.notifications);

            return newState
        })
    };



    onSoundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

        const signal = event.target.value;
        this.setState((prevState: SettingsState) => {

            const newState = iassign(prevState,
                s => s.notifications.sound.signal,
                () => signal
            );

            VKfoxAudio.play(newState.notifications.sound);

            Mediator.pub(Msg.NotificationsSettingsPut, newState.notifications);

            return newState
        })
    };

    onVolumeChange = (event) => {

        const volume = event.target.value;
        this.setState(prevState => {

            const newState = iassign(prevState,
                s => s.notifications.sound.volume,
                () => volume
            );

            VKfoxAudio.play(newState.notifications.sound);
            Mediator.pub(Msg.NotificationsSettingsPut, newState.notifications);

            return newState
        })
    };


    render() {
        const {notifications} = this.state;

        return (
            <form className="settings">

                <ForceOnlineSetting
                    forceOnline={this.state.forceOnline}
                    onForceOnlineToggle={this.onForceOnlineToggle}
                />

                <div className="settings__separator"/>

                <NotificationsSetting
                    notifications={notifications}
                    onNotificationsToggle={this.onNotificationsToggle}
                />


                <NotificationsSoundSetting
                    notifications={notifications}
                    onNotificationsSoundToggle={this.onNotificationsSoundToggle}
                />

                <NotificationsSignalSetting
                    notifications={notifications}
                    onSoundChange={this.onSoundChange}
                />

                <NotificationsVolumeSetting
                    notifications={notifications}
                    onVolumeChange={this.onVolumeChange}
                />

                <NotificationsSpeechSetting
                    notifications={notifications}
                    onNotificationsSoundToggle={this.onNotificationsSoundToggle}
                />


                <NotificationsPopupsSetting
                    notifications={notifications}
                    onNotificationsPopupToggle={this.onNotificationsPopupToggle}
                />

                <NotificationsTextSetting
                    notifications={notifications}
                    onNotificationsPopupToggle={this.onNotificationsPopupToggle}
                />

            </form>
        );
    }
}

export default SettingsPage