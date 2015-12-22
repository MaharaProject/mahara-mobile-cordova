/*jshint esnext:true*/
/*globals require:true*/

"use strict"; /* jshint -W097 */

let gulp    = require('gulp'),
    //babel   = require('gulp-babel'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    postcss = require('gulp-postcss'),
    replace = require('gulp-replace'),
    source = require("vinyl-source-stream"),
    babelify = require('babelify'),
    glob = require("glob"),
    fs = require("fs");

let paths = {
  css:     './src/**/*.css',
  jsentry: './src/js/index.js',
  lib:     './src/lib/**',
  image:   './src/image/**',
	html:     './src/*.html',
  ready:    './src/ready.js'
};

var js = ["./src/**/*.js", "!./src/lib/**"];

gulp.task('js', function (){
    // Process JS files into ES5
    browserify({
     entries: './src/js/index.js',
     extensions: ['.js'],
     debug: true
    })
    .transform(babelify, {presets:["es2015", "react", "stage-0"]})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function(){
    var processors = [
  		require('postcss-mixins'),
  		require('postcss-simple-vars'),
  		require('postcss-nested'),
  		require('autoprefixer')({ browsers: ['last 2 versions', '> 2%'] })
  	];
    gulp.src(paths.css)
      .pipe(postcss(processors))
      .pipe(gulp.dest("./dist"));
});

gulp.task('lib', function(){
    gulp.src(paths.lib)
      .pipe(gulp.dest("./dist/lib"));
});

gulp.task('image', function(){
    gulp.src(paths.image)
      .pipe(gulp.dest("./dist/image"));
});

gulp.task('html', function(){
    gulp.src(paths.html)
      //.pipe(replace(/<!--\#(.*?)\#-->/, ''))
      .pipe(gulp.dest("./dist"));
});

gulp.task('ready', function(){
    gulp.src(paths.ready)
      //.pipe(replace(/<!--\#(.*?)\#-->/, ''))
      .pipe(gulp.dest("./dist"));
});

gulp.task('locale', function (){
  var locales = {};
  glob("./src/locale/*/strings.txt", function(er, files){
    var filesRemaining = files.length,
        readLang = function(path){
          var localeId = path.replace(/^.*?locale\//,'').replace(/\/strings.txt.*?$/,''),
              locale = {};

          locales[localeId] = locale;

          fs.readFile(path, 'utf-8', function(err, data){
            //console.log(path);
            var lines = data.split("\n");
            for(var i = 0; i < lines.length; i++){
              var line = lines[i],
                  equals = line.indexOf("=");
              if(equals >= 0) locale[ line.substr(0, equals) ] = line.substr(equals+1);
            }
            end();
          });
        },
        end = function(){
          filesRemaining--;
          if(filesRemaining > 0) return;
          fs.writeFile('./dist/locales.json', JSON.stringify(locales), 'utf-8');
        };
    for(var i = 0; i < files.length; i++){
      readLang(files[i]);
    }

  });
});

gulp.task('default', ['js', 'css', 'lib', 'image', 'html', 'locale', 'ready']);

gulp.task('watch', function(){
  gulp.watch(['*','**'], ['default']);
});
