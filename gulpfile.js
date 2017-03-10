"use strict";

const gulp                 = require("gulp"),
    gulplog                = require("gulplog"),
    env                    = require("gulp-env"),
    less                   = require("gulp-less"),
    preprocess             = require("gulp-preprocess"),
    rename                 = require("gulp-rename"),
    inlineAngularTemplates = require("gulp-inline-angular-templates"),
    del                    = require("del"),
    runSequence            = require("run-sequence"),
    notifier               = require("node-notifier"),
    messageFormat          = require("gulp-messageformat"),
    webpack                = require("webpack"),
    eslint                 = require("gulp-eslint");

const webpackConfig = require("./webpack.config.js");

const FIREFOX_DIR = "/usr/lib/firefox/firefox.sh";
const Locales     = ["en", "ru", "uk"];


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

gulp.task("less", () => {
    return gulp.src("./pages/*.less", {cwd: "./develop"})
        .pipe(less())
        .pipe(gulp.dest("./build/firefox/pages"))
});

gulp.task("preprocess:popup", () => {
    return gulp.src("./develop/pages/popup.raw.html")
        .pipe(preprocess())
        .pipe(rename("popup.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:env", () => {
    return gulp.src("./develop/modules/env/env.raw.js")
        .pipe(preprocess())
        .pipe(rename("env.js"))
        .pipe(gulp.dest("./develop/modules/env"));
});

gulp.task("preprocess:install", () => {
    return gulp.src("./develop/pages/install.raw.html")
        .pipe(preprocess())
        .pipe(rename("install.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:manifest", () => {
    return gulp.src("./develop/manifest.raw.json")
        .pipe(preprocess())
        .pipe(rename("manifest.json"))
        .pipe(gulp.dest("./build/firefox"));
});

gulp.task("inline_angular_templates", () => {
    return gulp.src("./develop/modules/**/*.tmpl.html")
        .pipe(inlineAngularTemplates("./build/firefox/pages/popup.html", {base: "./develop"}))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("clean:firefox", () => del("./build/firefox/**"));

gulp.task("copy:firefox", () => {
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

;gulp.task("fonts", () => {
    return gulp.src([
        "./node_modules/font-awesome/fonts/fontawesome-webfont.ttf",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff2",
    ], {base: "./node_modules/font-awesome/"})
      .pipe(gulp.dest("./build/firefox/assets"))
});

gulp.task("webpack", (callback) => {
    const myConfig = Object.create(webpackConfig);
    let firstCallback = true;

    webpack(myConfig, (err, stats) => {
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

            if (!myConfig.watch && err) callback(err);
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

function i18n(locale) {
  gulp.task(`i18n-${locale}`, () => {
    return gulp.src(`./develop/modules/i18n/${locale}/*.json`)
      .pipe(messageFormat({locale: locale}))
      .pipe(gulp.dest(`./develop/modules/i18n`))
  });
}

Locales.forEach(i18n);

gulp.task("default", function (cb) {
        runSequence(
            ["env:firefox", "env:development", "clean:firefox"],
            "less",
            ["preprocess:env", "preprocess:install", "preprocess:popup", "preprocess:manifest"].concat(
              Locales.map( locale => `i18n-${locale}`)
            ),
            "inline_angular_templates",
            "webpack",
            ["copy:firefox", "fonts"],
             () => cb()
        )
    }
);