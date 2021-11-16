var gulp = require("gulp")
var browserify = require("browserify"); // is a tool for compiling node-flavored commonjs modules for the browser.
var babelify = require("babelify");
var source = require("vinyl-source-stream"); //it gives a stream
var gls = require('gulp-live-server'); // server hot reloading
const sass = require("gulp-sass")(require("sass"))
const image = require("gulp-image")
var concat = require('gulp-concat'); //This will concat files by your operating systems newLine. 
var buffer = require("vinyl-buffer"); //Convert streaming vinyl files to use buffers.
var uglify = require("gulp-uglify") // minify js
const uglifycss = require("gulp-uglifycss") //minify css
const imagemin = require('gulp-imagemin-changba'); //minify image
const tsify = require("tsify"); //allows you to specify the path that will be used when searching for the tsconfig. 


var paths = {

    main: ["src/index.tsx"],
    css: ['src/**/*.*css'],
    ts: ['src/**/*.ts*']

};

//Production

async function prodTsx() {
    return browserify({
            basedir: ".",
            debug: true,
            entries: [paths.main],
            cache: {},
            packageCache: {},
        })
        .plugin(tsify)
        .transform("babelify")
        .bundle()
        .on("error", (err) => {
            console.log("JS Error", err)
        })
        .pipe(source("bundle.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest("dist"))
}

async function prodCss() {
    return gulp.src(paths.css)
        .pipe(sass().once("error", sass.logError))
        .pipe(uglifycss({
            "uglyComments": true
        }))
        .pipe(concat("main.css"))
        .pipe(gulp.dest("dist"))
}

async function imageminify() {
    gulp.src('src/assets/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets'))
}

gulp.task("default", gulp.series(imageminify, prodCss, prodTsx))


//Development

async function tsx() {
    return browserify({
            basedir: ".",
            debug: true,
            entries: ["src/index.tsx"],
            cache: {},
            packageCache: {},
        })
        .plugin(tsify)
        .transform("babelify")
        .bundle()
        .on("error", (err) => {
            console.log("JS Error", err);
        })
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("dist"));
}

async function css(callback) {
    return gulp.src(paths.css)
        .pipe(sass().once("error", sass.logError))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist'));
};


async function img() {
    gulp.src('client/assets/*')
        .pipe(image())
        .pipe(gulp.dest('dist/assets/'));
};


//Start the server


gulp.task("dev", gulp.series(imageminify, css, tsx, function () {
    gulp.watch(paths.css, gulp.series(css))
    gulp.watch(paths.ts, gulp.series(tsx))


    var server = gls('server/server.js', {
        stdio: 'inherit'
    });
    server.start();

    // Reload server when backend files change.
    gulp.watch(['server/**/*.js'], function () {
        server.start.bind(server)();

    })

    gulp.watch(['static/**/*.{css,js,html}'], function (file) {
        server.notify(file);
    });
}));