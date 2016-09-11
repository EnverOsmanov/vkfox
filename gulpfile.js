var gulp = require('gulp'),
    env = require('gulp-env'),
    less = require('gulp-less'),
    preprocess = require('gulp-preprocess'),
    rename = require('gulp-rename'),
    inlineAngularTemplates = require('gulp-inline-angular-templates'),
    source = require('vinyl-source-stream'),
    bowerResolve = require('bower-resolve'),
    nodeResolve = require('resolve'),
    browserify = require('browserify'),
    del = require('del'),
    path = require('path'),
    exec = require('child_process').exec,
    runSequence = require('run-sequence'),
    debug = require('gulp-debug'),
    FIREFOX_DIR = '/usr/lib/firefox/firefox.sh',
    production = (process.env.NODE_ENV === 'production'),
    commonExternals = ['backbone', 'underscore', 'vow'],
    shimNames = [
        'angular',
        'moment',
        'moment1',
        'moment2',
        'angularKeypress',
        'angularSanitize',
        'javascript-linkify',
        'jEmoji',
        'bootstrapDropdown',
        'zepto',
        'zepto/event',
        'zepto/detect',
        'zepto/data',
        'zepto/selector',
        'bootstrapTooltip'
    ];

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

gulp.task('inline_angular_templates', function () {
    return gulp.src('./develop/modules/**/*.tmpl.html')
        .pipe(inlineAngularTemplates('./build/firefox/data/pages/popup.html'))
        .pipe(gulp.dest('./build/firefox/data/pages'));
});

gulp.task('browserify:vendorCommon', function () {
    var b = browserify({
        debug: !production
    });

    getNPMPackageIds().forEach(function (id) {
        b.require(nodeResolve.sync(id), {expose: id});
    });

    return b
        .bundle()
        .on('error', function (err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('vendor.js'))
        .pipe(gulp.dest('./build/firefox/data/pages'))
});

gulp.task('browserify:vendorPopup', function () {
    var b = browserify({
        debug: !production
    });

    getBowerPackageIds().forEach(function (id) {
        var resolvedPath = bowerResolve.fastReadSync(id);
        b.require(resolvedPath, {
            expose: id
        });
    });
    console.log(2);

    b.require(innerIds());

    return b
        .bundle()
        .on('error', function (err) {
            console.log(err.message);
            this.emit('end');
        })
        .pipe(source('vendor.pu.js'))
        .pipe(gulp.dest('./build/firefox/data/pages'))
});


gulp.task('browserify:firefoxPopup', function () {
    var extern = getBowerPackageIds()
        .concat(getNPMPackageIds())
        .concat(innerIds())
        .concat(ffSDK()).concat(['jQuery']),
        b = browserify('./develop/modules/app/app.pu.js', {debug: !production});

    extern.forEach(function (id) {
        b.external(id);
    });
    return b
        //.external(extern)
        .bundle()
        .pipe(source('popup.js'))
        .pipe(gulp.dest('./build/firefox/data/pages'))
});

gulp.task('browserify:firefoxInstall', function () {
    var b = browserify('./develop/modules/app/app.install.js', {
        // generate source maps in non-production environment
        debug: !production
    }).external(
        getBowerPackageIds()
            .concat(getNPMPackageIds())
            .concat(innerIds()).concat(['jQuery'])
    );
    ffSDK().forEach( function (id) {
        b.ignore(id)
    });

    return b.bundle().pipe(source('install.js'))
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
        './develop/data/bower_components/components-font-awesome/font/fontawesome-webfont.ttf',
        './develop/data/bower_components/emoji/lib/emoji.css',
        './develop/data/bower_components/emoji/lib/emoji.png',

        './develop/data/modules/yandex/search.moz.xml',
        './develop/data/modules/notifications/*.ogg',
        './develop/data/modules/notifications/firefox.html',
        './develop/data/modules/*/*.js'
    ], { base: './develop/'})
        .pipe(gulp.dest('./build/firefox'))
});

gulp.task('jpm:run', function (cb) {
    exec('jpm run', {cwd: './build/firefox'}, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
});

gulp.task('default', function (cb) {
        runSequence(
            ['env:firefox', 'env:development'],
            'clean:firefox',
            'less',
            ['preprocess:env', 'preprocess:install', 'preprocess:popup'],
            'inline_angular_templates',
            'browserify:vendorCommon',
            'browserify:vendorPopup',
            'browserify:firefoxPopup',
            'browserify:firefoxInstall',
            'copy:firefox',
            'jpm:run',
            function () {
                return cb();
            }
        )
    }
);


/**
 * Helper function(s)
 */

function getBowerPackageIds() {
    // read bower.json and get dependencies' package ids
    var bowerManifest = {};
    try {
        bowerManifest = require('./bower.json');
    } catch (e) {
        // does not have a bower.json manifest
    }
    return Object.keys(bowerManifest.dependencies) || [];

}

function getNPMPackageIds() {

    return commonExternals;

}

function innerIds() {
    return ['bootstrapTooltip', 'zepto/event', 'bootstrapDropdown'];
}

function ffSDK() {
    return ['sdk/system', 'chrome', 'toolkit/loader', 'sdk/simple-storage', 'sdk/timers', '@loader/options', 'sdk/panel',
        'sdk/request', 'sdk/tabs', 'sdk/self', 'sdk/page-mod', 'sdk/system/globals', 'sdk/page-worker', 'sdk/ui/button/action']
}