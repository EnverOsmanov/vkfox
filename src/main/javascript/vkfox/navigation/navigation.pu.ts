"use strict";
import * as Angular from "angular"


export default function init() {
    Angular.module('app').directive('navigation', ["$routeParams", function ($routeParams) {
        return {
            templateUrl: "vkfox/navigation/navigation.tmpl.html",
            replace: true,
            restrict: 'E',
            controller: function ($scope) {
                $scope.tabs = [
                    {
                        href: 'chat',
                        name: 'chat'
                    },
                    {
                        href: 'news',
                        name: 'news'
                    },
                    {
                        href: 'buddies',
                        name: 'buddies'
                    }
                ];
                $scope.activeTab = $routeParams.tab;
            }
        };
    }]);
}
