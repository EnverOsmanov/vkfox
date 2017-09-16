"use strict";

const gulp                 = require("gulp"),
    gulplog                = require("gulplog"),
    env                    = require("gulp-env"),
    less                   = require("gulp-less"),
    preprocess             = require("gulp-preprocess"),
    rename                 = require("gulp-rename"),
    del                    = require("del"),
    runSequence            = require("run-sequence"),
    notifier               = require("node-notifier"),
    messageFormat          = require("gulp-messageformat"),
    webpack                = require("webpack");

const Locales     = ["en", "ru", "uk"];
const __srcDir = "./src/main/typescript";
const __resources = "./src/main/resources";

const APP_VERSION = process.env.npm_package_version;

gulp.task("env:firefox",  () => {
    env({
        vars: {
        TARGET: "FIREFOX"
    }})
});

gulp.task("env:development", () => {
    env({
        vars: {
        NODE_ENV: "development"
    }})
});

gulp.task("env:version",  () => {
    env({ vars: { APP_VERSION }})
});

gulp.task("less", () => {
    return gulp.src("./pages/*.less", {cwd: __resources})
        .pipe(less())
        .pipe(gulp.dest("./target/firefox/assets"))
});


gulp.task("preprocess:manifest", () => {
    return gulp.src(__resources + "/manifest.raw.json")
        .pipe(preprocess())
        .pipe(rename("manifest.json"))
        .pipe(gulp.dest("./target/firefox"));
});

gulp.task("clean:firefox", () => del("./target/firefox/**"));

gulp.task("copy:firefoxResources", () => {
    return gulp.src([
        __resources + "/_locales/**",
        __resources + "/pages/*.html"
    ], {base: __resources })
      .pipe(gulp.dest("./target/firefox"))
});

gulp.task("copy:firefoxSrc", () => {
    return gulp.src([
        __srcDir + "/vkfox/auth/oauth.vk.com.js"
    ], {base: __srcDir })
        .pipe(gulp.dest("./target/firefox"))
});

gulp.task("fonts", () => {
    return gulp.src([
        "./node_modules/font-awesome/fonts/fontawesome-webfont.ttf",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff",
        "./node_modules/font-awesome/fonts/fontawesome-webfont.woff2",
    ], {base: "./node_modules/font-awesome/"})
      .pipe(gulp.dest("./target/firefox/assets"))
});

gulp.task("assets", () => {
    return gulp.src([
        __resources + "/assets/**",
        "./node_modules/emoji/lib/emoji.png",
    ])
      .pipe(gulp.dest("./target/firefox/assets"))
});

gulp.task("webpack", callback => {
    const webpackConfig = require("./webpack.config.js");

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

function i18n(locale) {
  gulp.task(`i18n-${locale}`, () => {
    return gulp.src(`${__srcDir}/vkfox/i18n/${locale}/*.json`)
      .pipe(messageFormat({ locale }))
      .pipe(gulp.dest(`${__srcDir}/vkfox/i18n`))
  });
}

Locales.forEach(i18n);

////
// Tasks for public use

gulp.task("production", (cb) => {
        runSequence(
            ["env:version", "env:firefox", "clean:firefox"],
            ["less", "assets", "fonts", "preprocess:manifest"]
                .concat(Locales.map( locale => `i18n-${locale}`)),
            [ "webpack", "copy:firefoxSrc", "copy:firefoxResources"],
            () => cb()
        )
    }
);

gulp.task("default", (cb) => {
        runSequence(
            ["env:version", "env:firefox", "env:development", "clean:firefox"],
            ["less", "assets", "fonts", "preprocess:manifest"]
                .concat(Locales.map( locale => `i18n-${locale}`)),
            [ "webpack", "copy:firefoxSrc", "copy:firefoxResources"],
             () => cb()
        )
    }
);