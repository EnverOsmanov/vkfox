"use strict";
import {CSSProperties} from "react";
import DimensionConf from "./DimensionConf";
// Inits width and height of the popup,
// Runs first, therefore without any external dependencies

const {
    MIN_WIDTH,
    MIN_HEIGHT,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT
} = DimensionConf;

export default function init() {
    let css: CSSProperties;

    try {
        css = JSON.parse(localStorage.getItem('resize'));
    }
    catch (e) {
        console.error("localStorage doesn't have 'resize' in JSON format")
    }
    if (css){
        if (css.width < MIN_WIDTH) css.width = DEFAULT_WIDTH;
        if (css.height < MIN_HEIGHT) css.height = DEFAULT_HEIGHT;
    }
    else {
        css = {
            width: 320,
            height: 480
        };
    }
    for (const property in css) {
        document.body.style[property] = css[property] + 'px';
    }

}
