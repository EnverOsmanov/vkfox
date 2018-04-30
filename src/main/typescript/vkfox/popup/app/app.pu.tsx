"use strict";
import * as React from "react"
import * as ReactDOM from "react-dom"
import dimensions from "../resize/dimensions.pu"
import anchor from "../anchor/anchor.pu"
import MainNavigation from "../navigation/MainNavigation";


dimensions();
ReactDOM.render(<MainNavigation/>, document.getElementById("app"));
anchor();