const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const htmlValidator = require('gulp-w3c-html-validator');
const   through2 =      require('through2');
const htmlmin = require('gulp-htmlmin');
const sync = require('browser-sync').create();
const gulpCopy = require('gulp-copy');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const terser = require('gulp-terser');

const options = require("./package.json").options;

const redefineconsole = '// redefine console';
const bynewconsole = redefineconsole + "\nconsole.log = function() {};";

gulp.task('prod', () => {
    return(
        gulp.src([options.assetDirectory + '/js/BACKOFFICE.js'])
            .pipe(replace(options.links.dev, options.links.prod))
            .pipe(replace(redefineconsole, bynewconsole))
            .pipe(gulp.dest(options.assetDirectory + '/js/'))
    );
});

gulp.task('test', () => {
    return(
        gulp.src([options.assetDirectory + '/js/BACKOFFICE.js'])
            .pipe(replace(options.links.dev, options.links.test))
            .pipe(replace(redefineconsole, redefineconsole + "\nconsole.log = function() {};"))
            .pipe(gulp.dest(options.assetDirectory + '/js/'))
    );
});

gulp.task('sass', () => {
    return (gulp.src('resources/assets/app-assets/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(options.assetDirectory + '/css'))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(options.assetDirectory + '/css/'))
        .pipe(sync.stream()));

});

gulp.task('updateBackOffice', () => {
    return (gulp.src(['resources/assets/js/angular/*.*'])
        .pipe(gulp.dest(options.assetDirectory + '/js')))
        .pipe(sync.stream());
});

gulp.task('compressDepsAngular', () => {
    return gulp.src(['resources/assets/js/angular/migrate/*.js'])
        .pipe(concat('angular-dependancies.js'))
        .pipe(gulp.dest(options.assetDirectory + '/js'))
        .pipe(terser().on('error', function(e){
            console.log(e);
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(options.assetDirectory + '/js'));
});

gulp.task('compress', () => {
    return gulp.src([
        'resources/assets/app-assets/vendors/js/vendors.min.js',
        'resources/assets/app-assets/vendors/js/forms/spinner/jquery.bootstrap-touchspin.js',
        'resources/assets/app-assets/js/core/app-menu.js',
        'resources/assets/app-assets/js/core/app.js',
        'resources/assets/app-assets/js/scripts/customizer.js',
        'resources/assets/app-assets/vendors/js/pickers/dateTime/moment-with-locales.min.js',
        'resources/assets/app-assets/vendors/js/pickers/daterange/daterangepicker.js',
        'resources/assets/app-assets/vendors/js/forms/validation/jquery.validate.min.js',
        'resources/assets/app-assets/vendors/js/pickers/pickadate/picker.js',
        'resources/assets/app-assets/vendors/js/pickers/pickadate/picker.date.js',
        'resources/assets/app-assets/vendors/js/pickers/pickadate/picker.time.js',
        'resources/assets/app-assets/vendors/js/pickers/pickadate/legacy.js',
        'resources/assets/js/main.js',
        'resources/assets/app-assets/js/bootstrap4-toggle.min.js',
        'resources/assets/app-assets/js/iziToast/dist/js/iziToast.min.js',
        'resources/assets/js/select2-full.js',
        'resources/assets/app-assets/vendors/js/forms/toggle/bootstrap-checkbox.min.js',
        'resources/assets/app-assets/vendors/js/extensions/unslider-min.js',
        'resources/assets/app-assets/vendors/js/extensions/clndr.min.js',
        'resources/assets/app-assets/vendors/js/extensions/underscore-min.js',
        'resources/assets/app-assets/vendors/js/charts/echarts/echarts.js',
        'resources/assets/app-assets/vendors/js/extensions/moment.min.js',
        'resources/assets/app-assets/vendors/js/forms/icheck/icheck.min.js',
        'resources/assets/app-assets/js/scripts/forms/form-login-register.js',
        'resources/assets/app-assets/js/scripts/forms/wizard-steps.js',
        'resources/assets/app-assets/js/scripts/forms/switch.js',

    ])
        .pipe(concat('main.js'))
        .pipe(gulp.dest(options.assetDirectory + '/js'))
        .pipe(terser().on('error', function(e){
            console.log(e);
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(options.assetDirectory + '/js'));
});

// Optimize images
gulp.task('images', () => {
    return gulp.src(['resources/assets/app-assets/images/**/*.*','resources/assets/app-assets/images/**/**/*.*','resources/assets/app-assets/images/**/**/**/*.*'])
        .pipe(imagemin({optimizationLevel: 7, progressive: true}))
        .pipe(gulp.dest(options.assetDirectory + '/images'));
});

// Copy Fonts, ajax, audio, video
gulp.task('others-assets', () => {
    return gulp.src(['resources/assets/app-assets/fonts/**/*.*','resources/assets/app-assets/audios/*.*'])
        .pipe(gulpCopy('public', {prefix: 1}));
});


function previewReload(){
    console.log("\n\t" + logSymbols.info,"Reloading Preview.\n");
    sync.reload();
}


gulp.task('serve', function() {
    sync.init({
        proxy: "http://localhost/" + options.links.dev,
        port: options.port + 1,
        files: ['resources/**/*.*','resources/**/**/*.*']
    });

    // Watch task
    gulp.watch('assets/css/*.css').on('change', gulp.series(sync.reload));
    gulp.watch(['resources/assets/app-assets/sass/**/*.scss', 'resources/assets/app-assets/sass/**/**/*.scss', 'resources/assets/app-assets/sass/*.scss'], gulp.series('sass')).on('change', sync.reload);

    gulp.watch('resources/assets/js/angular/migrate/*.js', gulp.series('compressDepsAngular'));
    gulp.watch(['resources/assets/js/angular/*.js','resources/assets/js/angular/**.js'], gulp.series('updateBackOffice')).on('change', sync.reload);

    gulp.watch(['resources/assets/js/**.js', 'resources/assets/app-assets/js/**/*.js', 'resources/assets/app-assets/js/**/**/*.js'], gulp.series('compress','images')).on('change', sync.reload);

    // For Laravel
    gulp.watch(['*.php', '../resources/views/*.php', '../resources/views/**/*.php']).on('change', sync.reload);
});


//Html validator
function validateHtml() {
    function handleFile(file, encoding, callback) {
        callback(null, file);
        if (!file.w3cjs.success)
            throw new Error('HTML validation error(s) found');
    };
    return gulp.src('pages/*.html')
        .pipe(htmlValidator())
        .pipe(through2.obj(handleFile));
}

// minify html
function htmlminify() {
    return gulp.src('html/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('html/minify'));
}

exports.validateHtml = validateHtml;
exports.htmlminify = htmlminify;

gulp.task('default', gulp.parallel('images', 'sass', 'compressDepsAngular', 'updateBackOffice', 'serve'));
