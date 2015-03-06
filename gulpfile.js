'use strict';

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var through = require('through2');

function logPipe(str) {
  return through.obj(function (file, enc, cb) {
    cb();
  }, function (cb) {
    gutil.log(str);
    cb();
  });
}

function doEslint(globs, singleFile) {
  if (singleFile) {
    gutil.log(gutil.colors.magenta('Start ESLint ' + globs[0]));
  }

  var task = gulp.src(globs)
    .pipe(eslint())
    .pipe(eslint.format());

  return singleFile ?
    task.pipe(logPipe(gutil.colors.magenta('Finish ESLint ' + globs[0]))) :
    task.pipe(eslint.failAfterError());
}

gulp.task('eslint', function () {
  return doEslint(['./**/*.js'], false);
});

gulp.task('watch', function () {
  gulp.watch('./**/*.js').on('change', function (event) {
    doEslint([path.relative(__dirname, event.path)], true);
  });
});

gulp.task('default', ['eslint']);
