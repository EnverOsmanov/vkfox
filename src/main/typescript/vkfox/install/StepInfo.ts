import Mediator from "../mediator/mediator.pu"
import Msg from "../mediator/messages"

export interface InstallButtons {
    no ?: string
    yes : string
}

export interface ButtonExtraInfo {
    makeAuth: boolean,

    updateState(): void
}

export interface StepInfo {
    mainText     : string
    buttonLabels : InstallButtons
    progress     ?: number

    onButtonClick(info ?: ButtonExtraInfo): void
}

const firstStepInfo: StepInfo = {
    progress: 0,
    mainText: 'Authorize VKfox with Vkontakte',
    buttonLabels: {
        no : 'skip',
        yes: 'login'
    },
    onButtonClick: (info: ButtonExtraInfo) => {

        if (info.makeAuth) {
            Mediator.once(Msg.AuthReady, info.updateState);
            Mediator.once(Msg.AuthToken, info.updateState);
            Mediator.pub(Msg.AuthOauth);
        }
        else info.updateState();
    }
};

const secondStepInfo: StepInfo = {
    mainText: 'Thank you!',
    buttonLabels: {
        yes: 'close'
    },
    onButtonClick: () => Mediator.pub(Msg.YandexDialogClose)
};

export const stepsInfo = [firstStepInfo, secondStepInfo];