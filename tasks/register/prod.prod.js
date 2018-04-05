module.exports = function (gulp, plugins) {
  gulp.task('prod', function(cb) {
    plugins.sequence(
      'compileAssets:prod',
      'concat:prod',
      'images:prod',
      cb
    );
  });
};
