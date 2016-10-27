"use strict";
/*
 * In FF default require doesn't provide some global functions,
 * like setImmidiate or setInterval,
 * which are used in3rd party libs.
 * This loader solves this issues.
 * Is used to laod unserscore and shim/vow.js libs
 */
exports.vow = require('vow');
exports.underscore = require('underscore');
