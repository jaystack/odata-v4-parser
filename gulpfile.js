var gulp = require('gulp');
var merge = require('merge2');
var istanbul = require('gulp-istanbul');
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
var mocha = require('gulp-mocha');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function(){
	var tsResult = gulp.src('src/*.ts')
	.pipe(sourcemaps.init())
	.pipe(ts(tsProject));

	return merge([
		tsResult.dts.pipe(gulp.dest('lib')),
		tsResult.js.pipe(sourcemaps.write({ includeContent: false, sourceRoot: '../src' })).pipe(gulp.dest('lib'))
	]);
});

gulp.task('test', ['build'], function(){
	return gulp.src('test/**/*.spec.ts')
	.pipe(ts({
		module: 'commonjs'
	}))
	.pipe(gulp.dest('test'))
	.pipe(mocha())
	.on('error', function(err){
		console.log(err.toString());
		this.emit('end');
	});
});

gulp.task('tdd', ['test'], function(){
	return gulp.watch(['src/**/*.ts', 'test/**/*.ts', 'test/**/*.json'], ['test']);
});

gulp.task('pre-coverage', ['build'], function () {
  return gulp.src(['lib/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage', ['pre-coverage'], function () {
  return gulp.src('test/**/*.spec.ts')
	.pipe(ts({
		module: 'commonjs'
	}))
	.pipe(gulp.dest('test'))
	.pipe(mocha())
    .pipe(istanbul.writeReports({
		reporters: ['json', 'text'],
		reportOpts: {
			json: { file: 'coverage/coverage.json' }
		}
	}));
});

gulp.task('remap', ['coverage'], function () {
    return gulp.src('coverage/coverage.json')
        .pipe(remapIstanbul({
            reports: {
                'html': 'coverage/html-report'
            }
        }));
});
gulp.task('default', ['remap']);