"use strict";
const Vow           = require('vow'),
    Mediator        = require('../mediator/mediator.js'),
    Browser         = require('../browser/browser.js'),
    Tracker         = require('../tracker/tracker.js'),
    PersistentModel = require('../persistent-model/persistent-model.js'),

    model = new PersistentModel(
        {lastPath: '/chat'},
        {name: 'router'}
    );

location.hash = model.get('lastPath');
require('../buddies/buddies.pu.js');
require('../settings/settings.pu.js');
require('../news/news.pu.js');
require('../chat/chat.pu.js');
require('angular').module('app')
    .config(function ($routeProvider, $locationProvider, $compileProvider, $provide) {
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
    })
    .run(function ($location, $rootScope) {
        // default tab is chat
        const READY = 2; //ready status from auth module

        $rootScope.$on('$routeChangeSuccess', function (scope, current) {
            let path;
            Mediator.pub('router:change', current.params);
            if (current.params.tab) {
                Tracker.trackPage();
                path = $location.path();
                model.set('lastPath', path);
                Mediator.pub('router:lastPath:put', path);
            }
        });

        function notificationsPromisify(resolve) {
            Mediator.sub('notifications:queue', resolve);
        }

        function authPromisify(resolve) {
            Mediator.sub('auth:state', resolve);
        }

        const notificationsPromise = new Vow.Promise(notificationsPromisify);
        const authPromise = new Vow.Promise(authPromisify);

        Vow.all([notificationsPromise, authPromise])
            .then(([queue, state]) => {
                $rootScope.$apply(function () {
                    if (state === READY) {
                        if (queue.length) {
                            // queue contains updates from tabs.
                            // Property 'type' holds value
                            $location.path('/' + queue[queue.length - 1].type);
                            $location.replace();
                        }
                    }
                });
            });

        authPromise.then(function (state) {
            if (state !== READY) {
                Mediator.pub('auth:oauth');
                Browser.closePopup();
            }
        });
        Mediator.pub('auth:state:get');
        Mediator.pub('notifications:queue:get');
    });
