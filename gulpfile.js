// basic
const gulp = require("gulp");
const { parallel, series } = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const browserSync = require("browser-sync").create();

// js
const webpak = require("webpack");
const webpackStream = require("webpack-stream");

// pug
const pug = require("gulp-pug");

// stylus
const stylus = require("gulp-stylus");
const autoprefixer = require("gulp-autoprefixer");

// config
const webpackConfig = require("./webpack.config");
const DEST_DIR = "./dist";

const typescriptBuild = function (cb) {
  return webpackStream(webpackConfig, webpak)
    .on("error", function (e) {
      this.emit("end");
    })
    .pipe(gulp.dest(DEST_DIR));
};
exports.typescriptBuild = typescriptBuild;

const pugBuild = (cb) => {
  gulp
    .src(["./src/pug/**/*.pug"])
    .pipe(
      plumber({
        errorHandler: notify.onError("<%= error.message %>"),
      })
    )
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(DEST_DIR));
  cb();
};
exports.pugBuild = pugBuild;

const stylusBuild = (cb) => {
  gulp
    .src("./src/stylus/**/*.styl")
    .pipe(
      plumber({
        errorHandler: notify.onError("<%= error.message %>"),
      })
    )
    .pipe(stylus())
    .pipe(
      autoprefixer({
        overrideBrowserslist: "last 2 versions",
      })
    )
    .pipe(gulp.dest(`${DEST_DIR}/css`));
  cb();
};
exports.stylusBuild = stylusBuild;

const imgCopy = (cb) => {
  gulp
    .src(["./src/img/*", "./src/md/img/*"])
    .pipe(gulp.dest(`${DEST_DIR}/img`));
  cb();
};
exports.imgCopy = imgCopy;

const modelCopy = (cb) => {
  gulp.src("./src/model/*").pipe(gulp.dest(`${DEST_DIR}/model`));
  cb();
};
exports.modelCopy = modelCopy;

const createServer = (cb) => {
  browserSync.init({
    server: {
      baseDir: DEST_DIR,
    },
  });
  cb();
};

const watch = () => {
  const reload = (cb) => {
    browserSync.reload();
    cb();
  };
  gulp.watch(
    "./src/**/*.ts",
    { ignoreInitial: true },
    series(typescriptBuild, reload)
  );
  gulp.watch(
    "./src/**/*.pug",
    { ignoreInitial: true },
    series(pugBuild, reload)
  );
  gulp.watch(
    "./src/**/*.styl",
    { ignoreInitial: true },
    series(stylusBuild, reload)
  );
  gulp.watch(["./src/img/*", "./src/md/img/*"], series(imgCopy, reload));
  gulp.watch("./src/model/*"), series(modelCopy, reload);
};
exports.watch = watch;

exports.default = series(
  parallel(typescriptBuild, pugBuild, stylusBuild, imgCopy, modelCopy),
  parallel(createServer, watch)
);
