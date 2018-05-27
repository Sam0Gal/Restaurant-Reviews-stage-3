module.exports = function (gulp, plugins) {
  gulp.task('default', function(cb) {
    plugins.sequence(
      'compileAssets:prod',
      'concat:prod',
      'min-css',
      ['images'],
      ['watch:assets', 'watch:views'],
      // 'browser-sync',   // for development only.
      cb
    );
  });
};
// module.exports = function (gulp, plugins) {
//   gulp.task('prod', function(cb) {
//     plugins.sequence(
//       'compileAssets:prod',
//       'concat:prod',
//       'images:prod',
//       'browser-sync',
//       cb
//     );
//   });
// };
