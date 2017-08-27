import * as React from "react"
import {CSSProperties} from "react"

interface InstallStepsProps {
    progress: number,
    step    : number
}


export default class InstallSteps extends React.Component<InstallStepsProps, undefined> {

    private style(): CSSProperties {
        return {
            width: `${this.props.progress}%`
        }
    }

    private classForActiveStep(index: number): string {
        return index <= this.props.step
            ? "app__bullet_active"
            : ""
    }


    render() {

        return (
            <div className="app__steps-wrap">

                <div className="app__steps">
                    <div
                        className={`app__bullet ${this.classForActiveStep(0)}`}>
                    </div>
                    <div
                        className={`app__bullet ${this.classForActiveStep(1)}`}>
                    </div>
                </div>

                <div
                    className="app__progress"
                    style={this.style()}>
                </div>

            </div>
        )
    }
}