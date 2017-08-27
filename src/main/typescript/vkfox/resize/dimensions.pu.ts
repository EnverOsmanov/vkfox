"use strict";
import {CSSProperties} from "react";
// Inits width and height of the popup,
// Runs first, therefore without any external dependencies
export default function init() {
    let css: CSSProperties;

    try {
        css = JSON.parse(localStorage.getItem('resize'));
    }
    catch (e) {
        console.error("localStorage doesn't have 'resize' in JSON format")
    }
    if (!css) {
        css = {
            width: 320,
            height: 480,
            fontSize: 12
        };
    }
    for (const property in css) {
        document.body.style[property] = css[property] + 'px';
    }

}
