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
// var uglify = plugins.uglify.default;
// gulp.task('concat:js', function() {
  //   return gulp.src(require('../pipeline').jsFilesToInject)
  //     //.pipe(plugins.jshint('.jshintrc'))
  //     //.pipe(plugins.jshint.reporter('default'))
  //     .pipe(plugins.concat('production.js'))
  //     .pipe(plugins.rename({ suffix: '.min' }))
  //     .pipe(uglify(/* {mangle: true} */))
  //     .pipe(gulp.dest('./.tmp/public/concat'))
  //     .pipe(plugins.if(growl, plugins.notify({ message: 'Concatenate Scripts task complete' })));
  // });
  var uglify = require('gulp-uglify-es').default;

  gulp.task('concat:prod', ['copy:build'], function() {
    gulp.src(require('../pipeline').jsFilesToInjectHome)
      //.pipe(plugins.jshint('.jshintrc'))
      //.pipe(plugins.jshint.reporter('default'))
      // .pipe(plugins.babel({
      //   presets: ['env']
      // }))
      .pipe(plugins.concat('productionHome.js'))
      .pipe(plugins.rename({ suffix: '.min' }))
      .pipe(uglify(/* {mangle: true} */))
      .pipe(gulp.dest('./.tmp/public/concat'))
      .pipe(plugins.gzip({gzipOptions: {level: 9}}))
      .pipe(gulp.dest('./.tmp/public/concat'));

    return gulp.src(require('../pipeline').jsFilesToInjectInfo)
      //.pipe(plugins.jshint('.jshintrc'))
      //.pipe(plugins.jshint.reporter('default'))
      // .pipe(plugins.babel({
      //   presets: ['env']
      // }))
      .pipe(plugins.concat('productionInfo.js'))
      .pipe(plugins.rename({ suffix: '.min' }))
      .pipe(uglify(/* {mangle: true} */))
      .pipe(gulp.dest('./.tmp/public/concat'))
      .pipe(plugins.gzip({gzipOptions: {level: 9}}))
      .pipe(gulp.dest('./.tmp/public/concat'));
  });

};
