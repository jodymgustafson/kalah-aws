const gulp = require("gulp");
const debug = require('gulp-debug');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const zip = require('gulp-zip');
const aws = require("aws-sdk");
const fs = require('fs');
var replace = require('gulp-replace');

const version = getVersion();
function getVersion() {
    let d = new Date;
    const dayOfYear = (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    return `${d.getFullYear()}.${dayOfYear}.${d.getHours() * 60 + d.getMinutes()}`;
}

function cleanDist() {
    return deleteFiles("./dist/**");
}

const copyFilesToDist = gulp.parallel(
    () => copyFiles("src/aws/*.js", "dist/kalah/aws/"),
    () => copyFiles("src/handlers/*.js", "dist/kalah/handlers/"),
    () => copyFiles("src/util/*.js", "dist/kalah/util/"),
    () => copyFiles("src/game/*.js", "dist/kalah/game/"),
    () => copyFiles("src/*.js", "dist/kalah/"),
);

function zipLambda() {
    return gulp
        .src("./dist/kalah/**", {nodir:true})
        .pipe(zip("kalah-api-lambda.zip"))
        .pipe(debug())
        .pipe(gulp.dest('./dist'));
}

function deployLambda(cb) {
    aws.config.region = 'us-east-2';
    const lambda = new aws.Lambda();
    const functionName = 'kalah-api';

    const zipFile = fs.readFileSync('./dist/kalah-api-lambda.zip');
    lambda.updateFunctionCode({
            FunctionName: functionName, 
            ZipFile: zipFile
        },
        (err, data) => {
            if (err) {
                if (err.statusCode === 404) {
                    const msg = `Unable to find lambda function ${functionName}. Verify the lambda function name and AWS region are correct.`;
                    console.error(msg);
                }
                else {
                    console.error('AWS API request failed. Check your AWS credentials and permissions.');
                }
            }
        });
    cb();
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
    return gulp
        .src(files)
        .pipe(debug())
        .pipe(gulp.dest(toFolder));
}

function deleteFiles(files) {
    if (typeof files == 'string') {
        files = [files];
    }
    console.log("Deleting files ", files);
    return gulp
        .src(files, {read:false, nodir:true})
        .pipe(debug())
        .pipe(clean());
}

function writeVersion() {
    return gulp
        .src('./src/version.js')
        .pipe(replace('{version}', version))
        .pipe(gulp.dest('./src/'));    
}

exports.default = gulp.series(cleanDist, writeVersion, copyFilesToDist, zipLambda);

exports.cleanDist = cleanDist;
exports.copyNewMatchEventHandlerFiles = copyFilesToDist;
exports.zipNewMatchEventHandler = zipLambda;
exports.deploy = deployLambda;
exports.writeVersion = writeVersion;