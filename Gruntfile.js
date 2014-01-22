"use strict";
module.exports = function (grunt) {
    var FIREFOX = 'FIREFOX',
        CHROME = 'CHROME',
        OPERA = 'OPERA',
        PRODUCTION = 'PRODUCTION',
        DEVELOPMENT = 'DEVELOPMENT',
        BROWSERS = [FIREFOX, CHROME, OPERA],
        SRC_DIR = 'develop/',
        LOCALES = ['ru', 'en', 'uk'];

    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-messageformat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env : {
            opera: {TARGET: OPERA},
            chrome: {TARGET: CHROME},
            firefox: {TARGET: FIREFOX},
            production: {ENV : PRODUCTION},
            development: {ENV : DEVELOPMENT}
        },
        inline_angular_templates: {
            popup: {
                files: {
                    'pages/popup.html': ['modules/*/*.tmpl.html']
                }
            }
        },
        browserify: (function () {
            var vendorShim = {
                'angularKeypress': {
                    path: 'bower_components/angular-ui-utils/modules/keypress/keypress.js',
                    exports: 'angular',
                    depends: {angular: 'angular'}
                },
                'bootstrapDropdown': {
                    path: 'bower_components/bootstrap/js/bootstrap-dropdown.js',
                    exports: 'jQuery',
                    depends: {zepto: 'jQuery'}
                },
                'bootstrapTooltip': {
                    path: 'bower_components/bootstrap/js/bootstrap-tooltip.js',
                    exports: 'jQuery',
                    depends: {zepto: 'jQuery'}
                },
                'angular': {
                    path: 'bower_components/angular-unstable/angular.js',
                    exports: 'angular'
                },
                'javascript-linkify': {
                    path: 'bower_components/javascript-linkify/ba-linkify.js',
                    exports: 'linkify',
                },
                'zepto': {
                    path: 'bower_components/zepto-bootstrap/zepto.js',
                    exports: '$'
                },
                'jEmoji': {
                    path: 'bower_components/emoji/lib/emoji.js',
                    exports: 'jEmoji'
                }
            }, options = {
                external: Object.keys(vendorShim).concat([
                    'backbone', 'underscore', 'vow'
                ]),
                ignore: [
                    'browser/browser.bg.js',
                    'tracker/tracker.bg.js',
                    './request.bg.js',
                    './tracker.bg.js',
                    './mediator.bg.js',
                    'timer',
                    'chrome',
                    'sdk/system',
                    'sdk/tabs',
                    'sdk/self',
                    'sdk/simple-storage'
                ]
            };

            return BROWSERS.reduce(function (browserify, browser) {
                browserify[browser.toLowerCase() + 'Popup'] = {
                    files: {
                        'pages/popup.js': ['modules/app/app.pu.js'],
                    },
                    options: options
                };
                browserify[browser.toLowerCase() + 'Install'] = {
                    files: {
                        'pages/install.js': ['modules/app/app.install.js'],
                    },
                    options: options
                };
                browserify[browser.toLowerCase() + 'Background'] = {
                    files: {
                        'pages/background.js': ['modules/app/app.bg.js'],
                    },
                    options: {
                        external: ['backbone', 'underscore', 'vow'],
                        ignore: [
                            './mediator.pu.js',
                            'browserAction',
                            'timer',
                            'chrome',
                            'sdk/system/unload',
                            'sdk/system',
                            'sdk/tabs',
                            'sdk/request',
                            'sdk/self',
                            'sdk/page-worker',
                            'sdk/page-mod',
                            'sdk/simple-storage',
                            'sdk/notifications',
                            browser === FIREFOX ? './yandex.webkit.bg.js':'./yandex.moz.bg.js'
                        ]
                    }
                };

                return browserify;
            }, {
                vendorCommon: {
                    src: ['backbone', 'vow', 'underscore'],
                    dest: 'pages/vendor.js',
                    options: {
                        alias: [
                            '../node_modules/backbone/backbone.js:backbone',
                            '../node_modules/underscore/underscore.js:underscore',
                            '../node_modules/vow/lib/vow.js:vow'
                        ],
                        ignore: ['timer']
                    }
                },
                vendorPopup: {
                    files: {
                        'pages/vendor.pu.js': [Object.keys(vendorShim)]
                    },
                    options: {shim: vendorShim}
                }
            });
        })(),
        "mozilla-addon-sdk": {
            '1_14': {
                options: {
                    revision: "1.14"
                }
            }
        },
        "mozilla-cfx": {
            run: {
                options: {
                    "mozilla-addon-sdk": "1_14",
                    extension_dir: ".",
                    command: "run",
                    arguments: "-p ../ff"
                }
            }
        },
        preprocess : {
            popup: {
                src : 'pages/popup.raw.html',
                dest : 'pages/popup.html'
            },
            install: {
                src : 'pages/install.raw.html',
                dest : 'pages/install.html'
            },
            manifest: {
                src : 'manifest.raw.json',
                dest : 'manifest.json'
            },
            env: {
                src : 'modules/env/env.raw.js',
                dest : 'modules/env/env.js'
            }
        },
        // optimize, preprocess only single file
        watch: BROWSERS.reduce(function (watch, browser) {
            // watch[browser] = {
                // files: browser + '/pages/*.raw.html',
                // tasks: ['preprocess:' + browser]
            // };

            return watch;
        }, {
            manifest: {
                files: 'manifest.raw.json',
                tasks: ['preprocess:manifest'],
                options: {
                    interrupt: true
                }
            },
            messages: {
                files: 'modules/i18n/**/*.json',
                tasks: ['messageformat'],
                options: {
                    interrupt: true
                }
            },
            less: {
                files: 'modules/**/*.less',
                tasks: ['less']
            },
            js: {
                files: 'modules/**/*.js',
                tasks: ['browserify']
            }
        }),
        //localization
        messageformat: LOCALES.reduce(function (memo, locale) {
            memo[locale] = {
                namespace: 'module.exports',
                locale: locale,
                inputdir: 'modules/i18n/' + locale,
                output: 'modules/i18n/' + locale + '.js'
            };

            return memo;
        }, {}),
        less: {
            all: {
                expand: true,
                cwd: 'pages/',
                dest: 'pages/',
                src: ['*.less'],
                ext: '.css',
                options: {
                    compile: true,
                    compress: process.env.ENV === PRODUCTION
                }
            }
        },
        // less: BROWSERS.reduce(function (less, browser) {
            // less[browser] = {
                // expand: true,
                // cwd: browser + '/pages/',
                // dest: browser + '/pages/',
                // src: ['*.less'],
                // ext: '.css',
                // options: {
                    // compile: true,
                    // compress: process.env.ENV === PRODUCTION
                // }
            // };
            // return less;
        // }, {}),
        clean: {
            // Warning: Cannot delete files outside the current working directory.
            options: {force: true},
            build: ['../build'],
            manifest: ['manifest.json'],
            pages: [
                'pages/*.html',
                '!pages/*.raw.html',
                'pages/*.js',
                'pages/*.css'
            ]
        },
        copy: BROWSERS.reduce(function (copy, browser) {
            copy[browser] = {
                expand: true,
                src: [
                    '_locales/**',
                    'assets/**',
                    'manifest.json',

                    'components/font-awesome/font/fontawesome-webfont.ttf',
                    'components/emoji/lib/emoji.png',
                    'components/emoji/lib/emoji.css',
                    'components/jquery/jquery.js',
                    'components/angular-unstable/angular.js',
                    'components/underscore/underscore.js',
                    'components/backbone/backbone.js',

                    'modules/auth/oauth.vk.com.js',
                    'modules/**/*.html',
                    'modules/**/*.ogg',
                    browser + '/pages/*.html',
                    '!' + browser + '/pages/*.raw.html',
                    browser + '/pages/*.js',
                    browser + '/pages/*.css',
                ],
                dest: '../build/' + browser
            };

            return copy;
        }, {}),
        //Next two targets concatenates js/css
        useminPrepare: {
            html: BROWSERS.reduce(function (html, browser) {
                return html.concat([
                    browser + '/pages/*.html',
                    '!' + browser + '/pages/*.raw.html'
                ]);
            }, []),
            options: {
                dest: '.'
            }
        },
        usemin: {
            html: BROWSERS.reduce(function (html, browser) {
                return html.concat([
                    browser + '/pages/*.html',
                    '!' + browser + '/pages/*.raw.html'
                ]);
            }, [])
        },
        compress: BROWSERS.reduce(function (compress, browser) {
            compress[browser] = {
                options: {
                    level: '9', //best compression
                    archive: '../build/' + browser + '.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: '../build/' + browser + '/',
                        src: ['**']
                    }
                ]
            };
            return compress;
        }, {})
    });


    grunt.file.setBase(SRC_DIR);

    grunt.registerTask('mozilla', [
        'env:firefox',
        'env:development',
        'less',
        'preprocess:env',
        'preprocess:install',
        'preprocess:popup',
        'inline_angular_templates',
        'browserify:vendorCommon',
        'browserify:vendorPopup',
        'browserify:firefoxPopup',
        'browserify:firefoxInstall',
        'mozilla-addon-sdk',
        'mozilla-cfx'
    ]);
    grunt.registerTask('chrome', [
        'env:development',
        'env:chrome',
        'less',
        'preprocess:env',
        'preprocess:popup',
        'preprocess:install',
        'preprocess:manifest',
        'inline_angular_templates',
        'browserify:vendorCommon',
        'browserify:vendorPopup',
        'browserify:chromePopup',
        'browserify:chromeInstall',
        'browserify:chromeBackground',
        'watch'
    ]);


};
