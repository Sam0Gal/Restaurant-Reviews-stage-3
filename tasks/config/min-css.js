module.exports = function(gulp, plugins) {
  gulp.task('min-css', ['copy:build'], function() {
    return gulp.src(require('../pipeline').cssFilesToInject)
    .pipe(plugins.cleanCss())
    .pipe(gulp.dest('./.tmp/public/css'));
  });
};
