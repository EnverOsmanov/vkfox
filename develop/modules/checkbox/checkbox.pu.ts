"use strict";
import * as Angular from "angular";

export default function init() {
    Angular.module('app').directive('checkbox', function () {
        return {
            templateUrl: 'modules/checkbox/checkbox.tmpl.html',
            replace    : true,
            restrict   : 'E',
            require    : 'ngModel',
            transclude : true,
            scope: {
                class   : '@',
                model   : '=ngModel',
                disabled: '=ngDisabled'
            }
        };
    });
}
