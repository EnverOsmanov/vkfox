"use strict";
import rectify from "../rectify/rectify.pu";
import * as _ from "underscore";
import * as moment from "moment";
import * as Config from '../config/config';
import I18N from '../i18n/i18n.pu';
import * as Angular from "angular";


export default function init() {
    rectify();

    Angular.module('app')
        .filter('i18n', () => {
            return function (input) {
                if (input) return I18N.get.apply(I18N, arguments);
            };
        })
        .filter('i18nHtml', ($sce) => {
            return function (input) {
                if (input) {
                    const text = I18N.get.apply(I18N, arguments);
                    return $sce.trustAsHtml(text);
                }
            };
        })
        .filter('duration', function () {
            /**
             * Returns time duration in format 'HH:mm'
             *
             * @param {Array} seconds
             *
             * @returns {String}
             */
            return (seconds) => {
                if (seconds) return moment.unix(seconds).format('HH:mm');
            };
        })
        .filter('timeago', function () {
            return (timestamp) => {
                if (timestamp) return moment(timestamp).fromNow();
            };
        })
        .filter('capitalize', function () {
            /**
             * Returns capitalized text
             *
             * @param {String} seconds
             *
             * @returns {String}
             */
            return function (str) {
                if (str && str.length) return str[0].toUpperCase() + str.substr(1);
            };
        })
        .filter('where', function () {
            /**
             * Returns object from collection,
             * by it's key/value pair
             *
             * @param {Array} input
             * @param {String} property
             * @param {Mixed} value
             *
             * @returns {Object}
             */
            return function (input, property, value) {
                let obj;
                if (input) {
                    obj = {};
                    obj[property] = value;
                    return _(input).findWhere(obj);
                }
            };
        })
        .filter('name', () => {
            /**
             * Returns names from profile's data
             *
             * @param {Object|Array} input
             *
             * @returns {String} String
             */
            return (input) => {
                function owner2Name(owner) {
                    //group profile
                    //user profile
                    if (owner.name) return owner.name;
                    else return owner.first_name + ' ' + owner.last_name;
                }

                if (input) {
                    return [].concat(input).map(owner2Name).join(', ');
                }
            };
        })
        .filter('addVKBase', () => {
            return (path) => {
                if (path.indexOf(Config.VK_BASE) === -1) {
                    if (path.charAt(0) === '/') path = path.substr(1);

                    return Config.VK_BASE + path;
                }
                else return path;
            };
        })
        .filter('slice', () => {
            return (arr, start, end) => {
                if (arr) return arr.slice(start, end);
            };
        })
        .filter('isArray', () => input => Angular.isArray(input));
}