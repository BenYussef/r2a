const mix = require('laravel-mix');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

const tailwindcss = require('tailwindcss')
const options = require("./package.json").options;

/*mix.js('resources/js/app.js', options.assetDirectory +'/js')
    .sass('resources/sass/app.scss', options.assetDirectory + '/css')
    .options({
        processCssUrls: false,
        postCss: [ tailwindcss('./tailwind.config.js') ],
    })
    .autoload({
        'jquery': ['$', 'window.jQuery', 'jQuery']
    })
    .copyDirectory('resources/js/angular', options.assetDirectory + '/js/angular')
    .copyDirectory('resources/json', options.assetDirectory + '/json')
    .copyDirectory('resources/fonts', options.assetDirectory + '/fonts')
    .copyDirectory('resources/images', options.assetDirectory + '/images')
    .copyDirectory('node_modules/slick-carousel/slick/ajax-loader.gif', options.assetDirectory + '/css')
    .copyDirectory('node_modules/summernote/dist/font/summernote.woff', options.assetDirectory + '/fonts/summernote')
    .browserSync({
        proxy: "http://localhost/" + options.links.dev,
        port: options.port + 1,
        files: ['resources/!**!/!*.*','resources/!**!/!**!/!*.*']
    });
mix.js('resources/js/app-laravel.js', 'public/assets/js');*/

mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css');
