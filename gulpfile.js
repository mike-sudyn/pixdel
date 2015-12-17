'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Clean output directory
gulp.task('clean', del.bind(null, ['dist'], {dot: true}));

// Lint JavaScript
gulp.task('jshint', function () {
    gulp.src(['app/assets/scripts/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        //.pipe($.jshint.reporter('fail'))
    ;
});

// browserify
gulp.task('browserify', function () {
    return gulp.src('./app/assets/scripts/*.js')
        .pipe($.browserify({insertGlobals : true}))
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/assets/scripts'));
});

// Copy html files from the root level (app)
gulp.task('html', function () {
    return gulp.src([ 'app/*.html' ], { dot: true })
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'copy'}));
});

// Copy images
gulp.task('images', function () {
    return gulp.src('app/assets/images/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe($.size({title: 'images'}));
});

// Compile stylesheets
gulp.task('styles', function () {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(['app/assets/styles/*.scss'])
        .pipe($.sass({
            precision: 10,
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe(gulp.dest('dist/assets/styles'))
        .pipe($.size({title: 'styles'}));
});

// Watch files for changes & reload
gulp.task('serve', ['default'], function () {
    browserSync({
        notify: false,
        // Customize console logging prefix
        logPrefix: 'SERVE',
        // https: true,
        server: ['dist']
    });

    gulp.watch(['app/*.html'], ['html', reload]);
    gulp.watch(['app/assets/styles/**/*.scss'], ['styles', reload]);
    gulp.watch(['app/assets/scripts/**/*.js'], ['jshint', 'browserify', reload]);
    gulp.watch(['app/assets/images/**/*'], ['images', reload]);
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
    runSequence('styles', ['jshint', 'html', 'images', 'browserify'], cb);
});
