const gulp = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const tap = require('gulp-tap');
const { templateFile, outputPath } = require("./config/config");

const del = require('del');
const path = require('path');
const gutil = require('gulp-util');
const combiner = require('stream-combiner2');;
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const minifycss = require('gulp-minify-css');
const jsonlint = require("gulp-jsonlint");
const fs = require("fs-extra");

var colors = gutil.colors;
const handleError = function (err) {
	console.log('\n')
	gutil.log(colors.red('Error!'))
	gutil.log('fileName: ' + colors.red(err.fileName))
	gutil.log('lineNumber: ' + colors.red(err.lineNumber))
	gutil.log('message: ' + err.message)
	gutil.log('plugin: ' + colors.yellow(err.plugin))
};
const getSubpackagesSrc = function () {
	const appJsonPath = "./" + outputPath + "/app.json";

	const data = fs.readFileSync(appJsonPath, "utf-8");
	const json = JSON.parse(data.toString());
	const subpackages = json.subpackages ? json.subpackages : [];

	return subpackages.map(ele => {
		return `./weixin/${ele.root}/**/*.scss`;
	})
};
const clean = function () {
	return del(['./dist/**']);
}
const jsonLint = function () {
	var combined = combiner.obj([
		gulp.src(['./weixin/**/*.json']),
		jsonlint(),
		jsonlint.reporter(),
		jsonlint.failAfterError()
	]);

	combined.on('error', handleError);
	return combined;
}

const json = gulp.series(jsonLint, function () {
	return gulp.src('./weixin/**/*.json')
		.pipe(gulp.dest('./dist'));
});

const assets = function () {
	return gulp.src('./weixin/assets/**')
		.pipe(gulp.dest('./dist/assets'))
};
const appWxss = function () {
	return gulp.src('./weixin/app.*')
		.pipe(gulp.dest('./dist'))
};
const templates = function () {
	return gulp.src('./weixin/**/*.wxml')
		.pipe(gulp.dest('./dist'));
}


const wxss = function () {
	const subpackagesSrc = getSubpackagesSrc();
	return gulp.src(['./weixin/pages/**/*.scss', ...subpackagesSrc])
		.pipe(
			replace(/@import(.+?);/g, ($1, $2) =>
				/*! 这种注释不会被clean-css 处理 */
				$2.includes('./_') ? $1 : `/*! ${$1} */`
			)
		)
		.pipe(sass.sync({
			outputStyle: 'expanded'
		}).on('error', sass.logError))
		.pipe(replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) => $3.replace(/\.scss/g, '.wxss')))

		.pipe(rename({
			extname: '.wxss'
		}))
		.pipe(gulp.dest('./dist/pages'));
}

const scripts = function () {
	return gulp.src('./weixin/**/*.js')
		.pipe(babel({
			presets: ["@babel/env"]
		}))
		.pipe(gulp.dest('./dist'))
}

const compiler = gulp.series(
	clean,
	json,
	assets,
	appWxss,
	templates,
	wxss,
	scripts,
	// watch
);

exports.dev = function () {
	// gulp.watch("./weixin/**/*.{scss,wxss,wxml,json,js}", () => {
	// 	compiler();
	// });
	gulp.watch("./weixin/**/*.{scss,wxss,wxml,json,js}", compiler);
}
//-----------------------

// function buildStyles() {
// 	return gulp.src('./weixin/pages/**/*.{scss,sass}')
// 		.pipe(
// 			replace(/@import(.+?);/g, ($1, $2) =>
// 				/*! 这种注释不会被clean-css 处理 */
// 				$2.includes('./_') ? $1 : `/*! ${$1} */`
// 			)
// 		)
// 		.pipe(sass.sync().on('error', sass.logError))
// 		.pipe(replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) => $3.replace(/\.scss/g, '.wxss')))
// 		.pipe(rename({
// 			extname: '.wxss'
// 		}))
// 		.pipe(gulp.dest('./dist/page'));

// };
// exports.buildStyles = buildStyles;

// gulp.task("buildStyles", buildStyles);
// exports.dev = function () {
// 	gulp.watch('./weixin/pages/**/*.{scss, sass}', gulp.series["buildStyles"]);
// };
