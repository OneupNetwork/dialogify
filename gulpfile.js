var gulp = require('gulp');
var sass = require('gulp-sass');
var terser = require('gulp-terser');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var size = require('gulp-size');
var fileinclude = require('gulp-file-include');

var p = function (path) {
    return __dirname + (path.charAt(0) === '/' ? '' : '/') + path;
};

gulp.task('sass', function() {
    return gulp.src(p('src/sass/*.scss'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(p('src/css')));
});

gulp.task('js', function() {
    return gulp.src([
            p('src/js/dialog-polyfill.js'),
            p('src/js/ResizeSensor.js'),
            p('src/js/dialogify.js')
        ])
        .pipe(sourcemaps.init())
        .pipe(fileinclude({
            basepath: '@root',
            filters: {
                addslashes: function(content){
                    return content.replace(/'/g, "\\'").replace(/\n/g, '');
                }
            }
        }))
        .pipe(terser())
        .on('error', function(err){
            console.log(err.toString())
         })
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(concat('dialogify.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(p('dist')))
        .pipe(gulp.dest(p('docs/js')));
});

gulp.task('build', gulp.series('sass', 'js'));
