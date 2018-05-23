"use strict";

import "../../../sass/vkfox/vkfox-io/index.scss"


const GOOGLE_VIEWER_URL = "http://docs.google.com/viewer?embedded=true&url=";
const docUrl = window.atob(location.hash.replace("#", ""));

document
    .querySelector(".doc")
    .setAttribute("src", GOOGLE_VIEWER_URL + encodeURIComponent(docUrl));


document
    .querySelector<HTMLButtonElement>(".button")
    .setAttribute("href", docUrl);
