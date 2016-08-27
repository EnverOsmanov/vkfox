"use strict";
module.exports = function (grunt) {
    var FIREFOX = 'FIREFOX',
        CHROME = 'CHROME',
        OPERA = 'OPERA',
        PRODUCTION = 'PRODUCTION',
        DEVELOPMENT = 'DEVELOPMENT',
        BROWSERS = [FIREFOX, CHROME, OPERA],
        SRC_DIR = 'develop/',
        LOCALES = ['ru', 'en', 'uk'],
        FIREFOX_DIR = '/usr/lib/firefox/firefox.sh';

    grunt.loadNpmTasks('grunt-inline-angular-templates');
    grunt.loadNpmTasks('grunt-messageformat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-jpm');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            opera: {TARGET: OPERA},
            chrome: {TARGET: CHROME},
            firefox: {TARGET: FIREFOX},
            production: {ENV: PRODUCTION},
            development: {ENV: DEVELOPMENT},
            fireloc: {FIREFOX_BIN: FIREFOX_DIR}
        },
        inline_angular_templates: {
            popup: {
                files: {
                    'pages/popup.html': ['modules/*/*.tmpl.html']
                }
            }
        },
        browserify: (function () {
            var shimNames = [
                    'angular',
                    'moment',
                    'moment1',
                    'moment2',
                    'angularKeypress',
                    'angularSanitize',
                    'bootstrapTooltip',
                    'javascript-linkify',
                    'jEmoji',
                    'bootstrapDropdown'
                ],
                commonExternals = ['backbone', 'underscore', 'vow',
                    'zepto',
                    'zepto/event',
                    'zepto/detect',
                    'zepto/data',
                    'zepto/selector'
                ], options = {
                    external: shimNames.concat(commonExternals),
                    ignore: [
                        'browser/browser.bg.js',
                        'tracker/tracker.bg.js',
                        './request.bg.js',
                        './tracker.bg.js',
                        './mediator.bg.js',
                        'chrome',
                        'toolkit/loader',
                        '@loader/options',
                        'sdk/ui/button/action',
                        'sdk/request',
                        'sdk/page-mod',
                        'sdk/page-worker',
                        'sdk/panel',
                        'sdk/timers',
                        'sdk/system',
                        'sdk/system/globals',
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
                        'pages/background.js': [
                            //zepto is hardcoded (simply concatenated)
                            //to make it globally available,
                            //because require('zepto') would break cfx xpi.
                            'bower_components/zeptojs/src/zepto.js',
                            'modules/app/app.bg.js'
                        ],
                    },
                    options: {
                        external: commonExternals,
                        ignore: [
                            'sdk/timers',
                            '@loader/options',
                            'sdk/ui/button/action',
                            'sdk/panel',
                            'sdk/system',
                            'sdk/system/globals',
                            'chrome',
                            'sdk/system/unload',
                            'sdk/system',
                            'sdk/tabs',
                            'sdk/request',
                            'sdk/self',
                            'sdk/page-worker',
                            'sdk/page-mod',
                            'toolkit/loader',
                            'sdk/simple-storage',
                            'sdk/notifications',
                            (browser !== FIREFOX) && './yandex.moz.bg.js',
                            (browser !== CHROME) && './yandex.webkit.bg.js'
                        ].filter(Boolean)
                    }
                };

                return browserify;
            }, {
                vendorCommon: {
                    src: commonExternals,
                    dest: 'pages/vendor.js',
                    options: {
                        alias: {
                            "backbone": '../node_modules/backbone/backbone.js',
                            "underscore": '../node_modules/underscore/underscore.js',
                            "vow": '../node_modules/vow/lib/vow.js',
                            "zepto": "../node_modules/zepto/src/zepto.js",
                            "zepto/event": "../node_modules/zepto/src/event.js",
                            "zepto/detect": "../node_modules/zepto/src/detect.js",
                            "zepto/data": "../node_modules/zepto/src/data.js",
                            "zepto/selector": "../node_modules/zepto/src/selector.js"
                        }
                    }
                },
                vendorPopup: {
                    files: {
                        'pages/vendor.pu.js': []
                    },
                    options: {
                        require: shimNames
                    }
                }
            });
        })(),
        jpm: {
            options: {
                src: "../build/firefox",
                xpi: "../build/firefox"
            }
        },
        preprocess: {
            popup: {
                src: 'pages/popup.raw.html',
                dest: 'pages/popup.html'
            },
            install: {
                src: 'pages/install.raw.html',
                dest: 'pages/install.html'
            },
            manifest: {
                src: 'manifest.raw.json',
                dest: 'manifest.json'
            },
            env: {
                src: 'modules/env/env.raw.js',
                dest: 'modules/env/env.js'
            }
        },
        watch: BROWSERS.reduce(function (watch, browser) {
            watch[browser.toLowerCase()] = {
                files: 'modules/**/*.js',
                tasks: [
                    'browserify:' + browser.toLowerCase() + 'Popup',
                    'browserify:' + browser.toLowerCase() + 'Background',
                    'browserify:' + browser.toLowerCase() + 'Install'
                ]
            };

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
        // Prevent Warning: Cannot delete files outside the current working directory.
        clean: BROWSERS.reduce(function (clean, browser) {
            var browserLowercased = browser.toLowerCase();
            clean[browserLowercased] = ['../build/' + browserLowercased];
            return clean;
        }, {options: {force: true}}),
        copy: [CHROME, OPERA].reduce(function (copy, browser) {
            copy[browser.toLowerCase()] = {
                expand: true,
                src: [
                    'manifest.json',

                    '_locales/**',
                    'assets/**',

                    'bower_components/font-awesome/font/fontawesome-webfont.ttf',
                    'bower_components/emoji/lib/emoji.css',
                    'bower_components/emoji/lib/emoji.png',

                    'modules/auth/oauth.vk.com.js',
                    'modules/resize/dimensions.pu.js',
                    'modules/notifications/*.ogg',

                    'pages/*.html',
                    '!pages/*.raw.html',
                    'pages/*.css',
                    'pages/*.js'
                ],
                dest: '../build/' + browser.toLowerCase()
            };

            return copy;
        }, {
            firefox: {
                expand: true,
                src: [
                    'package.json',
                    'packages/**',
                    'node_modules/backbone/*',
                    'node_modules/underscore/*',
                    'node_modules/vow/**/*',

                    'data/assets/**',

                    //best font for window and osx in firefox and chrome
                    'data/bower_components/font-awesome/font/fontawesome-webfont.ttf',
                    'data/bower_components/emoji/lib/emoji.css',
                    'data/bower_components/emoji/lib/emoji.png',

                    'data/modules/yandex/search.moz.xml',
                    'data/modules/notifications/*.ogg',
                    'data/modules/notifications/firefox.html',
                    'data/modules/*/*.js',

                    'data/pages/*.html',
                    '!data/pages/*.raw.html',
                    'data/pages/*.css',
                    'data/pages/*.js',
                    '!data/pages/background.js',
                ],
                dest: '../build/firefox'
            }
        }),
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
            compress[browser.toLowerCase()] = {
                options: {
                    level: '9', //best compression
                    archive: '../build/' + browser.toLowerCase() + '.zip'
                },
                files: [
                    {
                        expand: true,
                        cwd: '../build/' + browser.toLowerCase() + '/',
                        src: ['**']
                    }
                ]
            };
            return compress;
        }, {})
    });


    grunt.file.setBase(SRC_DIR);

    [FIREFOX].forEach(function (browser) {
        var browserLowercased = browser.toLowerCase(),
            commonTasks = [
                'env:firefox',
                'env:development',
                'env:fireloc',
                'less',
                'preprocess:env',
                'preprocess:install',
                'preprocess:popup',
                'inline_angular_templates',
                'browserify:vendorCommon',
                'browserify:vendorPopup',
                'browserify:firefoxPopup',
                'browserify:firefoxInstall'
            ];

        grunt.registerTask(browserLowercased, commonTasks.concat([
            'jpm:run'
        ]));
        grunt.registerTask('build:' + browserLowercased, commonTasks.concat([
            'clean:' + browserLowercased,
            'copy:' + browserLowercased,
            'jpm:xpi',
            'jpm:run'
        ]));
    });

    [CHROME, OPERA].forEach(function (browser) {
        var browserLowercased = browser.toLowerCase(),
            commonTasks = [
                'env:' + browserLowercased,
                'less',
                'messageformat',
                'preprocess:env',
                'preprocess:popup',
                'preprocess:install',
                'preprocess:manifest',
                'inline_angular_templates',
                'browserify:vendorCommon',
                'browserify:vendorPopup',
                'browserify:' + browserLowercased + 'Popup',
                'browserify:' + browserLowercased + 'Install',
                'browserify:' + browserLowercased + 'Background'
            ];

        grunt.registerTask(browserLowercased, commonTasks.concat([
            'watch:' + browserLowercased
        ]));
        grunt.registerTask('build:' + browserLowercased, commonTasks.concat([
            'clean:' + browserLowercased,
            'copy:' + browserLowercased,
            'compress:' + browserLowercased
        ]));
    });
};
