/*eslint strict: [2, "global"], no-var: 0*/

'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var through = require('through2');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var MAIN_FILES = './*.js';
var SRC_FILES = './src/**/*.js';
var DIST_DIR = './dist/';

// options for transpiling es6 to es5
var babelOptions = {
  // generators are available in Brackets' shell and also break sourcemaps
  blacklist: ['regenerator', 'strict']
};

// provides pipe to log stuff to console when certain task finishes
function logPipe(str) {
  return through.obj(function (file, enc, cb) {
    cb();
  }, function (cb) {
    gutil.log(str);
    cb();
  });
}

// prevents watch from crashing on errors
function swallowError(error) {
  gutil.log(gutil.colors.red(error.toString()));
  this.emit('end');
}

// helper for transpiling es6 files to es5
function doBabel(globs, singleFile) {
  if (singleFile) {
    gutil.log(gutil.colors.cyan('Start Babel ' + globs[0]));
  }

  var task = gulp.src(globs, {base: path.resolve(__dirname, 'src')})
    .pipe(sourcemaps.init())
    .pipe(babel(babelOptions))
    .on('error', swallowError)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(DIST_DIR));

  return singleFile ?
    task.pipe(logPipe(gutil.colors.cyan('Finish Babel ' + globs[0]))) :
    task;
}

// helper for linting files
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

gulp.task('babel', function () {
  return doBabel([SRC_FILES], false);
});

gulp.task('eslint', function () {
  return doEslint([MAIN_FILES, SRC_FILES], false);
});

gulp.task('watch', function () {
  gulp.watch([SRC_FILES]).on('change', function (event) {
    var filePath = path.relative(__dirname, event.path);
    if (fs.statSync(filePath).isFile()) {
      doEslint([filePath], true);
      doBabel([filePath], true);
    }
  });
});

gulp.task('build', ['babel']);
gulp.task('test', ['eslint']);
gulp.task('default', ['build', 'test']);
