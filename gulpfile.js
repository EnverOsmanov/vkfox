"use strict";

const gulp                 = require("gulp"),
    gulplog                = require("gulplog"),
    env                    = require("gulp-env"),
    less                   = require("gulp-less"),
    preprocess             = require("gulp-preprocess"),
    rename                 = require("gulp-rename"),
    inlineAngularTemplates = require("gulp-inline-angular-templates"),
    uglify                 = require("gulp-uglify"),
    source                 = require("vinyl-source-stream"),
    del                    = require("del"),
    path                   = require("path"),
    exec                   = require("child_process").exec,
    runSequence            = require("run-sequence"),
    debug                  = require("gulp-debug"),
    notifier               = require("node-notifier"),
    FIREFOX_DIR            = "/usr/lib/firefox/firefox.sh",
    production             = (process.env.NODE_ENV === "production");

const webpackStream = require("webpack-stream");
const webpack = webpackStream.webpack;
const named = require("vinyl-named");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const eslint = require("gulp-eslint");

var webpackConfig = require("./webpack.config.js");
var gutil = require("gulp-util");

gulp.task("env:firefox", function () {
    env({
        vars: {
        TARGET: "FIREFOX",
        FIREFOX_BIN: FIREFOX_DIR
    }})
});

gulp.task("env:development", function () {
    env({
        vars: {
        ENV: "DEVELOPMENT"
    }})
});

gulp.task("less", function () {
    return gulp.src("./pages/*.less", {cwd: "./develop"})
        .pipe(less())
        .pipe(gulp.dest("./build/firefox/pages"))
});

gulp.task("preprocess:popup", function () {
    return gulp.src("./develop/pages/popup.raw.html")
        .pipe(preprocess())
        .pipe(rename("popup.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:env", function () {
    return gulp.src("./develop/modules/env/env.raw.js")
        .pipe(preprocess())
        .pipe(rename("env.js"))
        .pipe(gulp.dest("./develop/modules/env"));
});

gulp.task("preprocess:install", function () {
    return gulp.src("./develop/pages/install.raw.html")
        .pipe(preprocess())
        .pipe(rename("install.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:manifest", function () {
    return gulp.src("./develop/manifest.raw.json")
        .pipe(preprocess())
        .pipe(rename("manifest.json"))
        .pipe(gulp.dest("./build/firefox"));
});

gulp.task("inline_angular_templates", function () {
    return gulp.src("./develop/modules/**/*.tmpl.html")
        .pipe(inlineAngularTemplates("./build/firefox/pages/popup.html", {base: "./develop"}))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("clean:firefox", function () {
    return del("./build/firefox/**")
});

gulp.task("copy:firefox", function () {
    return gulp.src([
        "./develop/pages/background.html",
        "./develop/_locales/**",
        "./develop/assets/**",
        //best font for window and osx in firefox and chrome
        "./develop/node_modules/emoji/lib/emoji.css",
        "./develop/node_modules/emoji/lib/emoji.png",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.ttf",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff2",

        "./develop/modules/yandex/search.moz.xml",
        "./develop/modules/notifications/*.ogg",
        "./develop/modules/notifications/firefox.html",
        "./develop/modules/*/*.js"
    ], {base: "./develop/"})
      .pipe(gulp.dest("./build/firefox"))
})

;gulp.task("fonts", function () {
    return gulp.src([
        "./node_modules/font-awesome/fonts/fontawesome-webfont.ttf",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff2",
    ], {base: "./node_modules/font-awesome/"})
      .pipe(gulp.dest("./build/firefox/assets"))
});

gulp.task("jpm:run", function (cb) {
    exec("web-ext run", {cwd: "./build/firefox"}, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
});

gulp.task("webpack", function (callback) {
    const myConfig = Object.create(webpackConfig);
    let firstCallback = true;

    webpack(myConfig, function(err, stats) {
        if (firstCallback) {
            firstCallback = false;

            if (!err) err = stats.toJson().errors[0];

            if (err) {
                notifier.notify({
                    title: "Webpack",
                    message: err
                });

                gulplog.error(err)
            }
            else {
                gulplog.info("[webpack:build]", stats.toString({
                    colors: true
                }));
            }

            if (!myConfig.watch && err) {
                callback(err)
            }
            else callback();
        }
    });
});

gulp.task("lint", () => {
    return  gulp.src(["./develop/modules/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("default", function (cb) {
        runSequence(
            ["env:firefox", "env:development", "clean:firefox"],
            "less",
            ["preprocess:env", "preprocess:install", "preprocess:popup", "preprocess:manifest"],
            "inline_angular_templates",
            "webpack",
            ["copy:firefox", "fonts"],
             () => cb()
        )
    }
);