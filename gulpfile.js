const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const autoprefixer = require('autoprefixer')
const browserSync = require('browser-sync').create()
const minimist = require('minimist')
//設置開發狀態
let envOptions = {
    string: 'env',
    default: {
        env: 'develop'
    }
}
let options = minimist(process.argv.slice(2), envOptions)
//目前開發狀態
console.log(options)
//remove public
gulp.task('clean', function () {
    return gulp.src('./public', { read: false })
        .pipe($.clean())
})
//pug
gulp.task('copyHTML', function buildHTML() {
    return gulp.src('./source/*.html')
        .pipe($.plumber())
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream())
})
//sass編譯
gulp.task('sass', function () {
    //針對瀏覽器加入前輟
    let plugins = [
        autoprefixer({ browsers: ['last 3 version'] }),
    ];

    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested',
            includePaths: ['./node_modules/bootstrap/scss']
        }).on('error', $.sass.logError))
        //壓縮CSS
        .pipe($.postcss(plugins))
        //壓縮CSS
        .pipe($.if(options.env === 'prod', $.cleanCss()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())
})
//JS編譯
gulp.task('babel', () =>
    gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(options.env === 'prod', $.uglify({
            //壓縮
            compress: {
                //刪除console
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
)
gulp.task('vendorsJs', () =>
    gulp.src(['./node_modules/jquery/dist/**/jquery.min.js', './node_modules/bootstrap/dist/js/**/bootstrap.min.js', './node_modules/vue/dist/vue.js'])
        .pipe($.sourcemaps.init())
        .pipe($.concat('vendors.js'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
)
//壓縮image
gulp.task('image-min', () =>
    gulp.src(['./source/images/*', './source/images/*/**'])
        .pipe($.if(options.env === 'prod', $.image()))
        .pipe(gulp.dest('./public/images'))
)
//Static server
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    })
})
gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
})
//watch
gulp.task('watch', gulp.parallel('browser-sync', function () {
    gulp.watch('./source/**/*.html', gulp.series('copyHTML'))
    gulp.watch('./source/scss/*.scss', gulp.series('sass'))
    gulp.watch('./source/js/*.js', gulp.series('babel'))
}))

gulp.task('bulid', gulp.series('clean', 'copyHTML', 'sass', 'babel', 'vendorsJs', 'image-min'))
//4.0要加入gulp.series
//default gulp
gulp.task('default', gulp.series('copyHTML', 'sass', 'babel', 'vendorsJs', 'image-min', 'watch'))