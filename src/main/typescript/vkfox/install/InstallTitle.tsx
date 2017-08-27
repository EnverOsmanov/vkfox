import * as React from "react"
import I18N from "../i18n/i18n"

export default class InstallTitle extends React.Component {


    render() {

        return (
            <h1 className="app__title">
                {I18N.get("install_noun")}
                <span className="app__brand">VKfox</span>
            </h1>
        )
    }
}