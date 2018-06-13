"use strict";
import * as React from "react"
import * as ReactDOM from "react-dom"
import dimensions from "../resize/dimensions.pu"
import anchor from "../anchor/anchor.pu"
import MainNavigation from "../navigation/MainNavigation";

import "../../../../sass/vkfox/popup.scss"
import "emoji/lib/emoji.css"
import Resizer from "../resize/Resizer";

const Popup: React.StatelessComponent = () => {
    return (
        <div className="fullpage">
            <MainNavigation/>
            <Resizer/>
        </div>
    )
};

dimensions();
ReactDOM.render(<Popup/>, document.getElementById("app"));
anchor();