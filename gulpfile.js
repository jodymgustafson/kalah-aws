const gulp = require("gulp");
const debug = require('gulp-debug');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const zip = require('gulp-zip');

const cleanDist = gulp.series(() => deleteFiles("./dist/**"));

const copyNewMatchEventHandlerFiles = gulp.parallel(
    () => copyFiles("src/aws/*.js", "dist/kalah/aws/"),
    () => copyFiles("src/handlers/*.js", "dist/kalah/handlers/"),
    () => copyFiles("src/util/*.js", "dist/kalah/util/"),
    () => copyFiles("src/game/*.js", "dist/kalah/game/"),
    () => copyFiles("src/*.js", "dist/kalah/"),
);

function zipNewMatchEventHandler() {
    return gulp
        .src("./dist/kalah/**", {nodir:true})
        .pipe(zip("kalah-api-lambda.zip"))
        .pipe(debug())
        .pipe(gulp.dest('./dist'));
}
  
function renameFile(file, newName) {
  console.log("Renaming file to " + newName)
  return gulp
    .src(file)
    .pipe(rename(newName))
    .pipe(debug())
    .pipe(gulp.dest('.'));
}

function copyFiles(files, toFolder) {
    if (typeof files == 'string') {
        files = [files];
    }
    console.log("Copying files to " + toFolder)
    return gulp.src(files)
        .pipe(debug())
        .pipe(gulp.dest(toFolder));
}

function deleteFiles(files) {
    if (typeof files == 'string') {
        files = [files];
    }
    console.log("Deleting files ", files);
    return gulp.src(files, {read:false, nodir:true})
        .pipe(debug())
        .pipe(clean());
}

const packageNewMatch = gulp.series(cleanDist, copyNewMatchEventHandlerFiles, zipNewMatchEventHandler);

exports.default = gulp.series(packageNewMatch);
exports.cleanDist = cleanDist;
exports.copyNewMatchEventHandlerFiles = copyNewMatchEventHandlerFiles;
exports.zipNewMatchEventHandler = zipNewMatchEventHandler;