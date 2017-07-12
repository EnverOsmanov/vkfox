"use strict";
import Browser from '../browser/browser.pu'
import * as Vow from 'vow'
import Mediator from '../mediator/mediator.pu'
import PersistentModel from '../persistent-model/persistent-model'
import * as Angular from "angular"
import buddiesPu from "../buddies/buddies.pu"
import settingsPu from "../settings/settings.pu"
import newsPu from "../news/news.pu"
import chatPu from "../chat/chat.pu"
import navigationPu from "../navigation/navigation.pu"
import itemListPu from "../item-list/item-list.pu"
import itemPu from "../item/item.pu"
import checkBoxPu from "../checkbox/checkbox.pu"
import Msg from "../mediator/messages";
import {AuthState} from "../auth/models";

const model = new PersistentModel(
    {lastPath: '/chat'},
    {name: 'router'}
);

function configFoo($routeProvider, $locationProvider, $compileProvider, $provide) {
    // Make Addon SDK compatible

    $locationProvider.hashPrefix('');
    $provide.decorator('$sniffer', function ($delegate) {
        $delegate.history = false;
        return $delegate;
    });

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension|moz-extension|resource):/);

    $routeProvider
        .when('/news', {
            redirectTo: '/news/my'
        })
        .when('/:tab', {
            templateUrl: function (params) {
                return [
                    'modules/', params.tab,
                    '/', params.tab, '.tmpl.html'
                ].join('');
            }
        })
        .when('/:tab/:subtab', {
            templateUrl: function (params) {
                return [
                    'modules/', params.tab,
                    '/', params.tab, '.tmpl.html'
                ].join('');
            }
        });
}

function runFoo($location, $rootScope) {

    $rootScope.$on('$routeChangeSuccess', function (scope, current) {
        let path;
        Mediator.pub(Msg.RouterChange, current.params);
        if (current.params.tab) {
            path = $location.path();
            model.set('lastPath', path);
            Mediator.pub(Msg.RouterLastPathPut, path);
        }
    });

    function notificationsPromisify(resolve) {
        Mediator.sub(Msg.NotificationsQueue, resolve);
    }

    function authPromisify(resolve) {
        Mediator.sub(Msg.AuthState, resolve);
    }

    const notificationsPromise = new Vow.Promise(notificationsPromisify);
    const authPromise = new Vow.Promise(authPromisify);

    Vow.all([notificationsPromise, authPromise])
        .then(([queue, state]) => {
            $rootScope.$apply(function () {
                if (state === AuthState.READY) {
                    if (queue.length) {
                        // queue contains updates from tabs.
                        // Property 'type' holds value
                        $location.path('/' + queue[queue.length - 1].type);
                        $location.replace();
                    }
                }
            });
        });

    authPromise.then( (state) => {
        if (state !== AuthState.READY) {
            Mediator.pub(Msg.AuthOauth);
            Browser.closePopup();
        }
    });
    Mediator.pub(Msg.AuthStateGet);
    Mediator.pub(Msg.NotificationsQueueGet);
}


export default function init() {


    location.hash = model.get('lastPath');
    navigationPu();
    buddiesPu();
    settingsPu();
    newsPu();
    chatPu();

    itemPu();
    itemListPu();
    checkBoxPu();

    Angular.module('app')
        .config(configFoo)
        .run(runFoo);
}

