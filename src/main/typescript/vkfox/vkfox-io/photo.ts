"use strict";

import "../../../less/vkfox/vkfox-io/index.less"


const imageUrl = window.atob(location.hash.replace("#", ""));

document
    .querySelector(".image-area__placeholder")
    .setAttribute("src", imageUrl);

document
    .querySelector(".image-area__image")
    .setAttribute("src", imageUrl);

document
    .querySelector(".button")
    .setAttribute("href", imageUrl);