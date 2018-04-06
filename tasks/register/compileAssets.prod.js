module.exports = function (gulp, plugins) {
  gulp.task('compileAssets', function(cb) {
    plugins.sequence(
      'clean:dev',
      //'jst:dev',
      // 'sass:dev',
      'copy:dev',
      cb
    );
  });

  gulp.task('compileAssets:prod', function(cb) {
    plugins.sequence(
      'clean:dev',
      'clean:build',
      //'jst:dev',
      // 'sass:prod',
      // 'copy:build', I disabled it because I made it as a dependency for concat:prod
      cb
    );
  });
};
