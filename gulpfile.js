'use strict';

const gulp                 = require('gulp'),
    gulplog                = require('gulplog'),
    env                    = require('gulp-env'),
    less                   = require('gulp-less'),
    preprocess             = require('gulp-preprocess'),
    rename                 = require('gulp-rename'),
    inlineAngularTemplates = require('gulp-inline-angular-templates'),
    uglify                 = require('gulp-uglify'),
    source                 = require('vinyl-source-stream'),
    del                    = require('del'),
    path                   = require('path'),
    exec                   = require('child_process').exec,
    runSequence            = require('run-sequence'),
    debug                  = require('gulp-debug'),
    FIREFOX_DIR            = '/usr/lib/firefox/firefox.sh',
    production             = (process.env.NODE_ENV === 'production');

const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const named = require('vinyl-named');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const eslint = require("gulp-eslint");

gulp.task('env:firefox', function () {
    env({
        vars: {
        TARGET: 'FIREFOX',
        FIREFOX_BIN: FIREFOX_DIR
    }})
});

gulp.task('env:development', function () {
    env({
        vars: {
        ENV: 'DEVELOPMENT'
    }})
});

gulp.task('less', function () {
    return gulp.src('./pages/*.less', {cwd: './develop'})
        .pipe(less())
        .pipe(gulp.dest('./build/firefox/data/pages'))
});

gulp.task('preprocess:popup', function () {
    return gulp.src('./develop/pages/popup.raw.html')
        .pipe(preprocess())
        .pipe(rename('popup.html'))
        .pipe(gulp.dest('./build/firefox/data/pages'));
});

gulp.task('preprocess:env', function () {
    return gulp.src('./develop/modules/env/env.raw.js')
        .pipe(preprocess())
        .pipe(rename('env.js'))
        .pipe(gulp.dest('./build/firefox/data/modules/env'));
});

gulp.task('preprocess:install', function () {
    return gulp.src('./develop/pages/install.raw.html')
        .pipe(preprocess())
        .pipe(rename('install.html'))
        .pipe(gulp.dest('./build/firefox/data/pages'));
});

gulp.task('preprocess:manifest', function () {
    return gulp.src('./develop/manifest.raw.json')
        .pipe(preprocess())
        .pipe(rename('manifest.json'))
        .pipe(gulp.dest('./build/firefox'));
});

gulp.task('inline_angular_templates', function () {
    return gulp.src('./develop/modules/**/*.tmpl.html')
        .pipe(inlineAngularTemplates('./build/firefox/data/pages/popup.html', {base: './develop'}))
        .pipe(gulp.dest('./build/firefox/data/pages'));
});

gulp.task('clean:firefox', function () {
    return del('./build/firefox')
});

gulp.task('copy:firefox', function () {
    return gulp.src([
        './develop/package.json',
        './develop/data/assets/**',
        './develop/node_modules/backbone/*',
        './develop/node_modules/underscore/*',
        './develop/node_modules/vow/**/*',
        //best font for window and osx in firefox and chrome
        './develop/node_modules/emoji/lib/emoji.css',
        './develop/node_modules/emoji/lib/emoji.png',
        './develop/node_modules/font-awesome/fonts/fontawesome-webfont.ttf',
        './develop/node_modules/font-awesome/fonts/fontawesome-webfont.woff',
        './develop/node_modules/font-awesome/fonts/fontawesome-webfont.woff2',

        './develop/data/modules/yandex/search.moz.xml',
        './develop/data/modules/notifications/*.ogg',
        './develop/data/modules/notifications/firefox.html',
        './develop/data/modules/*/*.js'
    ], { base: './develop/'})
        .pipe(gulp.dest('./build/firefox'))
});

gulp.task('jpm:run', function (cb) {
    exec('web-ext run', {cwd: './build/firefox'}, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
});

gulp.task('webpack', function (callback) {
    let firstBuildReady = false;

    function done(err, stats) {
        firstBuildReady = true;

        if (err) { // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
            return;  // emit('error', err) in webpack-stream
        }

        gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
            colors: true
        }));

    }

    let options = {
        output: {
            path: __dirname + '/build',
            filename: "[name].js"
        },
        watch  : true,
        devtool: true ? "cheap-inline-module-source-map" : null,
        plugins: [
            new webpack.IgnorePlugin(/^sdk\//),
            new webpack.IgnorePlugin(/^@loader\/options/),
            new webpack.IgnorePlugin(/^toolkit\/loader/),
            new webpack.IgnorePlugin(/^chrome$/),
            new webpack.NoErrorsPlugin(),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en|uk/),
            new webpack.optimize.CommonsChunkPlugin({
                name: "vendor"
            })
        ],
        resolve: {
            alias: {
                angularKeypress  : 'angular-ui-utils/modules/keypress/keypress.js',
                bootstrapTooltip : 'bootstrap/js/tooltip.js',
                bootstrapDropdown: 'bootstrap/js/dropdown.js',
                'zepto/event'    : 'zepto/src/event',
                'zepto/detect'   : 'zepto/src/detect',
                'zepto/data'     : 'zepto/src/data',
                'zepto/selector' : 'zepto/src/selector'
            }
        }
    };

   return gulp.src(['./develop/modules/app/app.*.js'])
       .pipe(plumber({
           errorHandler: notify.onError( err => ({
               title: 'Webpack',
               message: err.message
           }))
       }))
       .pipe(named())
       .pipe(webpackStream(options, null, done))
       .pipe(gulp.dest('build/firefox/data/pages'))
       .on('data', function() {
           if (firstBuildReady && !callback.called) {
               callback.called = true;
               callback();
           }
       });
});

gulp.task('lint', () => {
    return  gulp.src(['./develop/modules/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('default', function (cb) {
        runSequence(
            ['env:firefox', 'env:development', 'clean:firefox'],
            'less',
            ['preprocess:env', 'preprocess:install', 'preprocess:popup', 'preprocess:manifest'],
            'inline_angular_templates',
            'webpack',
            'copy:firefox',
            //'jpm:run',
            function () {
                return cb();
            }
        )
    }
);