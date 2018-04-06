module.exports = function(gulp, plugins) {
  gulp.task('browser-sync', function() {
    var browserSync = plugins.browserSync;
    browserSync.create();
    browserSync.init({
      proxy: 'localhost:1337'
    });
  });
};
