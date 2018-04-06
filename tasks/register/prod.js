module.exports = function (gulp, plugins) {
  gulp.task('prod', function(cb) {
    plugins.sequence(
      'compileAssets:prod',
      'images:prod',
      'concat:prod',
      'browser-sync',
      cb
    );
  });
};
