"use strict";
import * as React from "react"
import * as ReactDOM from "react-dom"
import dimensions from "../components/resize/dimensions.pu"
import anchor from "../components/anchor/anchor.pu"
import MainNavigation from "../navigation/MainNavigation";

import "../../../../../sass/vkfox/popup.scss"
import "emoji/lib/emoji.css"
import Resizer from "../components/resize/Resizer";


const Popup: React.FunctionComponent = () => {
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