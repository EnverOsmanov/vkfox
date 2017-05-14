"use strict";
import dimensions from "../resize/dimensions.pu"
import * as Angular from "angular"
import resize from "../resize/resize.pu"
import filters from "../filters/filters.pu"
import anchor from "../anchor/anchor.pu"
import tooltip from "../tooltip/tooltip.pu"
import routerPu from "../router/router.pu"
import tracker from "../tracker/tracker"

try {
    dimensions();
    Angular.module('app', ['ui.keypress', 'ngSanitize', 'ngRoute', 'ngAnimate']);
    require('angular-route');
    require('angular-animate');
    require('angularKeypress');
    require('angular-sanitize');
    resize();
    filters();
    anchor();
    tooltip();
    routerPu();
} catch (e) {
    // we don't use window.onerror
    // because Firefox doesn't provide an error object,
    // only line number and column
    tracker.error(e.stack);
    throw e;
}
