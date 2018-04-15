/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 *
 */
module.exports = function(gulp, plugins, growl) {
  // plugins.livereload.listen();

  // Watch API files
  // NOTE This watcher is set-up by the sails-hook-autoreload NPM package

  // Watch assets

  var browserSync = plugins.browserSync;
  // browserSync.create();
  // browserSync.init({
  //   proxy: 'localhost:1337'
  // });

  gulp.task('watch:assets', function() {
    gulp.watch(['assets/**!(css)/*', 'tasks/pipeline.js'], ['concat:prod']).on('change', browserSync.reload);
    gulp.watch('assets/css/*.css', ['min-css']).on('change', browserSync.reload);
  });

  // Watch views
  gulp.task('watch:views', function() {
    gulp.watch(['views/*', 'views/**/*'], ['concat:prod']).on('change', browserSync.reload);
  });

};
