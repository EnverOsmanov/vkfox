import * as React from "react"
import * as ReactDOM from "react-dom"
import anchor from "../../popup/anchor/anchor.pu";
import MainNavigation from "../../popup/navigation/MainNavigation";

import "../../../../../sass/vkfox/popup.scss"
import "emoji/lib/emoji.css"


const Sidebar: React.StatelessComponent = () => {
    return (
        <div className="fullpage">
            <MainNavigation/>
        </div>
    )
};


ReactDOM.render(<Sidebar/>, document.getElementById("app"));
anchor();