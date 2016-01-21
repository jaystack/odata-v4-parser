var gulp = require('gulp');
var merge = require('merge2');
var mocha = require('gulp-mocha');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function(){
	var tsResult = gulp.src('src/*.ts')
	.pipe(ts(tsProject));

	return merge([
		tsResult.dts.pipe(gulp.dest('lib')),
		tsResult.js.pipe(gulp.dest('lib'))
	]);
});

gulp.task('test', ['build'], function(){
	return gulp.src('test/**/*.spec.ts')
	.pipe(ts({
		module: 'commonjs'
	}))
	.pipe(gulp.dest('test'))
	.pipe(mocha());
});

gulp.task('tdd', ['test'], function(){
	return gulp.watch(['src/**/*.ts', 'test/**/*.ts'], ['test']);
});
gulp.task('default', ['build']);
