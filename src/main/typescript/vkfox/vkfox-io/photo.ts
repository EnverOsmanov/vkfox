"use strict";

import "../../../sass/vkfox/vkfox-io/index.scss"


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