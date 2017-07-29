"use strict";
import * as Angular from "angular"
import Mediator from "../mediator/mediator.pu"
import anchor from "../anchor/anchor.pu"
import filters from "../filters/filters.pu"
import Msg from "../mediator/messages";

try {
    const angularApp = Angular.module('app', []);

    anchor();
    filters();

    angularApp
        .controller('AppCtrl', AppCtrl);
}
catch (err) {
    throw err
}

function AppCtrl($scope) {
    const data = {
        // authorization  step
        '0': {
            mainText: 'Authorize VKfox with Vkontakte',
            buttonLabels: {
                no : 'skip',
                yes: 'login'
            },
            onButtonClick: (makeAuth) => {
                function onLogIn() {
                    $scope.$apply( () => $scope.step++ );
                }

                if (makeAuth) {
                    Mediator.once(Msg.AuthReady, onLogIn);
                    Mediator.once(Msg.AuthToken, onLogIn);
                    Mediator.pub(Msg.AuthOauth);
                }
                else $scope.step++;
            }
        },
        // thanks and close
        '1': {
            mainText: 'Thank you!',
            buttonLabels: {
                no : null,
                yes: 'close'
            },
            onButtonClick: () => Mediator.pub(Msg.YandexDialogClose)
        }
    };

    $scope.next = () => $scope.step++;

    $scope.$watch('step', () => {
        $scope.progress = Math.min(
            100 * (1 / 4 + $scope.step / 2),
            100
        );
        Angular.extend($scope, data[$scope.step]);
        $scope.noButton = data[$scope.step].noButton;
    });
    $scope.step = 0;
}
