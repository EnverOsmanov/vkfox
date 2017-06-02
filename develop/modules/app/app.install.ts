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

                if (makeAuth) {
                    Mediator.once(Msg.AuthToken, () => {
                        $scope.$apply( () => $scope.step++ );
                    });
                    Mediator.pub(Msg.AuthOauth);
                }
                else $scope.step++;
            }
        },
        // licence agreement
        '1': {
            mainText: 'Accept license agreement',
            buttonLabels: {
                no : null,
                yes: 'accept'
            },
            onButtonClick: () => $scope.step++
        },
        // yandex installation
        '2': {
            mainText: 'Install Yandex search',
            buttonLabels: {
                no : 'no',
                yes: 'install_verb'
            },
            onButtonClick: (install) => {
                $scope.step++;

                Mediator.pub(Msg.YandexSettingsPut, {
                    enabled: install
                });
            }
        },
        // thanks and close
        '3': {
            mainText: 'Thank you!',
            buttonLabels: {
                no : null,
                yes: 'close'
            },
            onButtonClick: () => Mediator.pub(Msg.YandexDialogClose)
        }
    };

    $scope.next = function () {
        $scope.step++;
    };
    $scope.$watch('step', function () {
        $scope.progress = Math.min(
            100 * (1 / 6 + $scope.step / 3),
            100
        );
        Angular.extend($scope, data[$scope.step]);
        $scope.noButton = data[$scope.step].noButton;
    });
    $scope.step = 0;
}
