import * as React from "react"
import I18N from "../i18n/i18n"
import {InstallButtons} from "./StepInfo";

interface InstallControlsProps {
    step        : number
    buttonLabels: InstallButtons

    onButtonClick(makeAuth?: boolean): void
}

export default class InstallControls extends React.Component<InstallControlsProps, object> {


    render() {
        const noLabel = this.props.buttonLabels.no;
        const yesLabel = this.props.buttonLabels.yes;

        return (
            <div className="app__controls">

                <div
                    hidden={!noLabel}
                    className="app__button"
                    onClick={() => this.props.onButtonClick(false)}>
                    { noLabel ? I18N.get(noLabel) : ""}
                </div>

                <div
                    hidden={yesLabel == null}
                    className="app__button app__button_next"
                    onClick={() => this.props.onButtonClick(true)}>
                    {I18N.get(yesLabel)}
                </div>

            </div>
        )
    }
}