"use strict";

const gulp                 = require("gulp"),
    gulplog                = require("gulplog"),
    env                    = require("gulp-env"),
    preprocess             = require("gulp-preprocess"),
    rename                 = require("gulp-rename"),
    del                    = require("del"),
    notifier               = require("node-notifier"),
    webpack                = require("webpack");

const __srcDir = "./src/main/typescript";
const __resources = "./src/main/resources";

const APP_VERSION = process.env.npm_package_version;

gulp.task("env:firefox",  done => {
    env({
        vars: {
        TARGET: "FIREFOX"
    }});
    done()
});

gulp.task("env:development", done => {
    env({
        vars: {
        NODE_ENV: "development"
    }});
    done()
});

gulp.task("env:version",  done => {
    env({ vars: { APP_VERSION }});
    done()
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
    ], {base: __resources })
      .pipe(gulp.dest("./target/firefox"))
});

gulp.task("copy:firefoxSrc", () => {
    return gulp.src([
        __srcDir + "/vkfox/common/auth/oauth.vk.com.js"
    ], {base: __srcDir })
        .pipe(gulp.dest("./target/firefox"))
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

    let firstCallback = true;

    webpack(webpackConfig, (err, stats) => {
        if (firstCallback) {
            firstCallback = false;

            if (!err) err = stats.toJson().errors[0];

            if (err) {
                notifier.notify({
                    title: "Webpack",
                    message: err
                });

                gulplog.error("[webpack in gulp]", err)
            }
            else {
                gulplog.info("[webpack:build]", stats.toString({
                    colors: true
                }));
            }

            if (!webpackConfig.watch && err) callback(err);
            else callback();
        }
    });
});

////
// Tasks for public use

gulp.task("production",
        gulp.series(
            gulp.parallel("env:version", "env:firefox", "clean:firefox"),
            gulp.parallel("assets", "preprocess:manifest"),
            gulp.parallel( "webpack", "copy:firefoxSrc", "copy:firefoxResources")
        )
);

gulp.task("default",
        gulp.series(
            gulp.parallel("env:version", "env:firefox", "env:development", "clean:firefox"),
            gulp.parallel("assets", "preprocess:manifest"),
            gulp.parallel("webpack", "copy:firefoxSrc", "copy:firefoxResources")

        )
);