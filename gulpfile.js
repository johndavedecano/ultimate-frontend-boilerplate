var autoprefixer       = require('gulp-autoprefixer');
var beeper             = require('beeper');
var browserSync        = require('browser-sync');
var cache              = require('gulp-cache');
var cleanCSS           = require('gulp-clean-css');
var gconcat            = require('gulp-concat');
var gulp               = require('gulp');
var gutil              = require('gulp-util');
var imagemin           = require('gulp-imagemin');
var notify             = require('gulp-notify');
var plumber            = require('gulp-plumber');
var pug                = require('gulp-pug');
var rename             = require("gulp-rename");
var sass               = require('gulp-sass');
var sourcemaps         = require('gulp-sourcemaps');
var uglify             = require('gulp-uglify');
var clean              = require('gulp-clean');
var del                = require('del');
//
var jsVendorFiles      = [];             // Holds the js vendor files to be concatenated
var myJsFiles          = ['js/*.js'];    // Holds the js files to be concatenated
var fs                 = require('fs');  // ExistsSync var to check if font directory patch exist

var onError            = function(err) { // Custom error msg with beep sound and text color
    notify.onError({
      title:    "Gulp error in " + err.plugin,
      message:  err.toString()
    })(err);
    beeper(3);
    this.emit('end');
    gutil.log(gutil.colors.red(err));
};

gulp.task('styles', function() {
  gulp.src('styles/*.scss')
  .pipe(plumber({ errorHandler: onError }))
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(autoprefixer({
    browsers: ['last 5 versions'],
    cascade: false}))
  .pipe(cleanCSS({ format: 'beautify' }))
  .pipe(sourcemaps.write())
  .pipe(rename({ suffix: '.min'}))
  .pipe(gulp.dest('build/css'));
});

gulp.task('templates', function() {
  gulp.src('./templates/screens/*.pug')
  .pipe(plumber({ errorHandler: onError }))
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('build/'));
});

gulp.task('fonts', function() {
  gulp.src('./fonts/*.*')
  .pipe(gulp.dest('build/fonts'));
});

gulp.task('scripts', function() {
  return gulp.src(myJsFiles.concat(jsVendorFiles))
  .pipe(plumber({ errorHandler: onError }))
  .pipe(sourcemaps.init())
  .pipe(gconcat('bundle.js'))
  .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(rename({ suffix: '.min'}))
  .pipe(gulp.dest('build/js'));
});

gulp.task('images', function() {
  gulp.src('img/**/*')
  .pipe(cache(imagemin({
    optimizationLevel: 3,
    progressive: true,
    interlaced: true})))
  .pipe(gulp.dest('build/img/'));
});

gulp.task('default', function() {
  console.log("Use 'gulp setup' command to initialize the project files");
});

gulp.task('setup', function() {
  gulp.start('styles', 'templates', 'scripts', 'images', 'fonts');
});

gulp.task('watch', function() {
  gulp.watch('styles/**/*',                        ['styles']);
  gulp.watch(['templates/**/*', './*.pug'],        ['templates']);
  gulp.watch('js/*.js',                            ['scripts']);
  gulp.watch('img/**/*',                           ['images']);

// init server
  browserSync.init({
    server: {
      proxy: "local.build",
      baseDir: "build/"
    }
  });

  gulp.watch(['build/**'], browserSync.reload);
});
