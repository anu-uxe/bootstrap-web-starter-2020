const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const del = require("del");
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const merge = require("merge-stream");
//const sourcemaps = require('gulp-sourcemaps');


var paths = {
    styles: {
        src: 'src/**/*.scss', // paths.styles.src
        dist: 'dist/css'// paths.styles.dist
    },
    scripts: {
        src: 'src/**/*.js', // paths.scripts.src
        dist: 'dist/js', // paths.scripts.dist
        vendor: 'dist/vendor' // paths.scripts.public_vendor
    },

    html: {
        dist: 'dist/*.html' // paths.html.dist
    }
};

// Compile sass into CSS
gulp.task('sass', function () {
    return gulp.src("./src/scss/**/*.scss", 'sass')
        //.pipe(sourcemaps.init())
        .pipe(sass())
        //.pipe(sourcemaps.write('./map'))
        .pipe(gulp.dest("./dist/css"))
        .pipe(browserSync.stream());
});

// Compile theme
gulp.task('theme', function () {
    return gulp.src("./src/themes/*.scss", 'theme')
        .pipe(sass())
        .pipe(gulp.dest("./dist/css/themes"))
        .pipe(browserSync.stream());
});

// Move web app JS Files to dist/js
gulp.task('js', function () {
    return gulp.src('src/js/*.js')
        .pipe(gulp.dest("./dist/js"))
        .pipe(browserSync.stream());
});

// Clean vendor
function clean() {
    return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap
    var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
        .pipe(gulp.dest('./dist/vendor/bootstrap'));
    // Font Awesome CSS
    var fontAwesomeCSS = gulp.src('./node_modules/@fortawesome/fontawesome-free/css/**/*')
        .pipe(gulp.dest('./dist/vendor/fontawesome-free/css'));

    var animateCSS = gulp.src('./node_modules/animate.css/*.css')
        .pipe(gulp.dest('./dist/vendor/animate-css'));

    // jQuery Easing
    var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest('./dist/vendor/jquery-easing'));
    // jQuery
    var jquery = gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulp.dest('./dist/vendor/jquery'));
    // Simple Line Icons
    var simpleLineIconsFonts = gulp.src('./node_modules/simple-line-icons/fonts/**')
        .pipe(gulp.dest('./dist/vendor/simple-line-icons/fonts'));
    var simpleLineIconsCSS = gulp.src('./node_modules/simple-line-icons/css/**')
        .pipe(gulp.dest('./dist/vendor/simple-line-icons/css'));

    return merge(bootstrap, fontAwesomeCSS, animateCSS, jquery, jqueryEasing, simpleLineIconsFonts, simpleLineIconsCSS);
}

//Minify CSS
gulp.task('minify-css', function () {
    return gulp.src("./dist/css/*.css")
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/css/minified-css'));
});


// Move Images to aseets/img
gulp.task('imgs', function () {
    return gulp.src('src/img/*')
        .pipe(gulp.dest('dist/img'));
});


// watch files
gulp.task('serve', gulp.series('sass', function () {
    browserSync.init({
        server: './dist'
    });

    gulp.watch(paths.styles.src, gulp.parallel('sass')).on('change', browserSync.reload)
    gulp.watch(paths.scripts.src, gulp.parallel('js'))
    gulp.watch(paths.html.dist).on('change', browserSync.reload)
    gulp.watch(paths.styles.dist + '/*.css', gulp.parallel('minify-css'));
}));


const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel('theme', 'js', 'minify-css', 'imgs', 'serve'));

exports.default = build;
exports.vendor = vendor;