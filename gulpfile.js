const gulp = require('gulp');
const sass = require('gulp-sass');
const terser = require('gulp-terser');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const size = require('gulp-size');
const fileinclude = require('gulp-file-include');

let p = function (path) {
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
