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
const __srcDir = "./src/main/javascript";
const __resources = "./src/main/resources";


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
    return gulp.src("./pages/*.less", {cwd: __resources})
        .pipe(less())
        .pipe(gulp.dest("./build/firefox/assets"))
});

gulp.task("preprocess:popup", () => {
    return gulp.src(__resources + "/pages/popup.raw.html")
        .pipe(preprocess())
        .pipe(rename("popup.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:env", () => {
    return gulp.src(__srcDir + "/vkfox/env/env.raw.js")
        .pipe(preprocess())
        .pipe(rename("env.js"))
        .pipe(gulp.dest(__srcDir + "/vkfox/env"));
});

gulp.task("preprocess:install", () => {
    return gulp.src(__resources + "/pages/install.raw.html")
        .pipe(preprocess())
        .pipe(rename("install.html"))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("preprocess:manifest", () => {
    return gulp.src(__resources + "/manifest.raw.json")
        .pipe(preprocess())
        .pipe(rename("manifest.json"))
        .pipe(gulp.dest("./build/firefox"));
});

gulp.task("inline_angular_templates", () => {
    return gulp.src(__srcDir + "/vkfox/**/*.tmpl.html")
        .pipe(inlineAngularTemplates("./build/firefox/pages/popup.html", {base: __srcDir}))
        .pipe(gulp.dest("./build/firefox/pages"));
});

gulp.task("clean:firefox", () => del("./build/firefox/**"));

gulp.task("copy:firefoxResources", () => {
    return gulp.src([
        __resources + "/pages/background.html",
        __resources + "/_locales/**"
    ], {base: __resources })
      .pipe(gulp.dest("./build/firefox"))
});

gulp.task("copy:firefoxSrc", () => {
    return gulp.src([
        __srcDir + "/vkfox/auth/oauth.vk.com.js"
    ], {base: __srcDir })
        .pipe(gulp.dest("./build/firefox"))
});

gulp.task("fonts", () => {
    return gulp.src([
        "./node_modules/font-awesome/fonts/fontawesome-webfont.ttf",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff2",
    ], {base: "./node_modules/font-awesome/"})
      .pipe(gulp.dest("./build/firefox/assets"))
});

gulp.task("assets", () => {
    return gulp.src([
        __resources + "/assets/**",
        "./node_modules/emoji/lib/emoji.png",
    ])
      .pipe(gulp.dest("./build/firefox/assets"))
});

gulp.task("webpack", callback => {
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
    return  gulp.src([__srcDir + "/vkfox/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

function i18n(locale) {
  gulp.task(`i18n-${locale}`, () => {
    return gulp.src(`${__srcDir}/vkfox/i18n/${locale}/*.json`)
      .pipe(messageFormat({locale: locale}))
      .pipe(gulp.dest(`${__srcDir}/vkfox/i18n`))
  });
}

Locales.forEach(i18n);

gulp.task("default", function (cb) {
        runSequence(
            ["env:firefox", "env:development", "clean:firefox"],
            ["less", "assets", "fonts",
                "preprocess:env", "preprocess:install", "preprocess:popup", "preprocess:manifest"]
                .concat(Locales.map( locale => `i18n-${locale}`)),
            ["inline_angular_templates", "webpack", "copy:firefoxSrc", "copy:firefoxResources"],
             () => cb()
        )
    }
);