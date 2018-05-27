/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 *
 */
module.exports = function(gulp, plugins, growl) {
  var uglify = require('gulp-uglify-es').default;

  gulp.task('concat:prod', ['copy:build'], function() {
    gulp.src(require('../pipeline').jsFilesToInjectHome)
      .pipe(plugins.concat('productionHome.js'))
      .pipe(plugins.rename({ suffix: '.min' }))
      .pipe(uglify(/* {mangle: true} */))
      .pipe(gulp.dest('./.tmp/public/js'))
      // .pipe(plugins.gzip({gzipOptions: {level: 9}}))
      // .pipe(gulp.dest('./.tmp/public/js'));

    return gulp.src(require('../pipeline').jsFilesToInjectInfo)
      .pipe(plugins.concat('productionInfo.js'))
      .pipe(plugins.rename({ suffix: '.min' }))
      .pipe(uglify(/* {mangle: true} */))
      .pipe(gulp.dest('./.tmp/public/js'))
      // .pipe(plugins.gzip({gzipOptions: {level: 9}}))
      // .pipe(gulp.dest('./.tmp/public/js'));
  });

};
