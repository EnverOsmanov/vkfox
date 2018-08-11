import * as React from "react"
import I18N from "../../common/i18n/i18n"

interface InstallStepTextProps {
    step    : number,
    mainText: string
}

export default class InstallStepText extends React.Component<InstallStepTextProps, object> {


    render() {

        return (
            <div
                className={`app__main app__main_step_${this.props.step}`}>
                {I18N.get(this.props.mainText)}
            </div>
        )
    }
}