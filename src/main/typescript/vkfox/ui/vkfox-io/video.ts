"use strict";

import "../../../../sass/vkfox/vkfox-io/index.scss"


const LARGE_PLAYER = "large-player";
const videoUrl = window.atob(location.hash.replace("#", ""));


function onButtonClick() {
    const body = document.body;

    if (~body.className.indexOf(LARGE_PLAYER)) {
        body.className = body.className.replace(LARGE_PLAYER, "");
    } else {
        body.className += " " + LARGE_PLAYER;
    }
}

document
    .querySelector<HTMLVideoElement>(".video")
    .src = videoUrl;

document
    .querySelector<HTMLButtonElement>(".button")
    .onclick = onButtonClick;