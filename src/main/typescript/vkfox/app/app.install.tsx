import * as React from "react"
import * as ReactDOM from "react-dom"
import InstallTitle from "../install/InstallTitle"
import InstallSteps from "../install/InstallSteps"
import InstallStepText from "../install/InstallStepText"
import InstallControls from "../install/InstallControls"
import InstallState from "../install/InstallState";
import {InstallButtons, stepsInfo} from "../install/StepInfo";


class App extends React.Component<undefined, InstallState> {

    constructor() {
        super();

        this.state = {step: 0}
    }


    mainText(): string {
        return stepsInfo[this.state.step].mainText
    }

    progress(): number {
        const currentProgress = 100 * (1 / 4 + this.state.step / 2);

        return Math.min(currentProgress, 100);
    }

    buttonLabels(): InstallButtons {
        return stepsInfo[this.state.step].buttonLabels
    }

    updateState = () => {
        this.setState((prevState: InstallState) => {
            return {
                ...prevState,
                step: prevState.step + 1
            }
        })
    };

    onButtonClick(): (boolean) => void {
        const updateState = this.updateState;
        return (makeAuth?: boolean) => {

            const firstButtonInfo = this.state.step == 0
                ? { updateState, makeAuth }
                : null;


            return stepsInfo[this.state.step].onButtonClick(firstButtonInfo)
        }
    }


    render() {
        return (

            <div className="app__content">
                <InstallTitle/>
                <InstallSteps step={this.state.step} progress={this.progress()}/>

                <InstallStepText step={this.state.step} mainText={this.mainText()}/>
                <InstallControls step={this.state.step} buttonLabels={this.buttonLabels()} onButtonClick={this.onButtonClick()}/>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"));