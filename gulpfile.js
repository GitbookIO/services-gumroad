var _ = require('lodash');
var path = require('path');
var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var exec = require('child_process').exec;

var foreman;

process.on('exit', function(code) {
    if (foreman) foreman.kill(code);
});

// Less to css
gulp.task('styles', function() {
    return gulp.src('./stylesheets/index.less')
    .pipe(less({
        paths: [ path.join(__dirname) ]
    }))
    .pipe(minifyCSS())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./public/'));
});


gulp.task('default', ['styles'], function(cb) {
    foreman = exec('foreman start', cb);
    foreman.stdout.on('data', function(data) {
        console.log(data);
    });

    gulp.watch('stylesheets/**/*.less', ['styles']).on('change', function(event) {
        console.log('Less File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});
