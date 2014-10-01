#!/usr/bin/env node
/*
 * Tool to crawl a Reveal.js slide deck and capture each fragment to build a PDF.
 * Author: Katie Miller (codemiller)
 */

var fs = require('fs');
var path = require('path');
var build = require('./../build.js');
var capture = require('./../capture.js');
var resolutionPattern = /(\d+)x(\d+)/;

var argv = require('yargs')
      .options('t', {
        alias: 'target',
        default: 'output',
        describe: 'Directory to write the images and PDF'
      })
      .options('o', {
        alias: 'output',
        default: 'presentation',
        describe: 'Filename for the PDF (without an extension)'
      })
      .options('resolution', {
        describe: 'Resolution for viewport; if unspecified, tool will use the Reveal.js slide dimensions'
      })
      .options('format', {
        default: 'jpeg',
        describe: 'Format of images captured'
      })
      .options('controls', {
        default: false,
        boolean: true
      })
      .options('wait', {
        alias: 'wait-time',
        default: 1000,
        describe: 'Number of milliseconds to wait for each slide/fragment to load before capture'
      })
      .options('quality', {
        default: 100,
        describe: 'Quality of images captured'
      })
      .options('build', {
        default: true,
        boolean: true,
        describe: 'Skip slide capture and build a PDF from images in the target directory'
      })
      .options('capture', {
        default: true,
        boolean: true,
        describe: 'Capture the slides, but do not render to PDF'
      })
      .options('controls', {
        default: false,
        describe: 'Show the Reveal.js controls'
      })
      .options('max-index', {
        default: 9999,
        describe: 'Maximum to use for frame indices'
      })
      .check(function(argv){
        if (['jpeg', 'png'].indexOf(argv.format)) {
          throw new TypeError('--format should be either png or jpeg.');
        }
      })
      .check(function(argv){
        if (argv.resolution && !argv.resolution.match(resolutionPattern)){
          throw new TypeError('Resolution must have format {height}x{width}');
        }
      })
      .usage('Save Reveal.js as PDF.\nUsage: $0 http://myrevealpres.com')
      .demand(1, 'Reveal.js URL needs to be provided as an argument.')
      .strict()
      .argv;

var targetDir = path.join(process.cwd(), argv.target);
var resolution = null;
var url = argv._[0];

fs.mkdir(targetDir, function (err) {
   if (err && err.code !== 'EEXIST') {
       console.log('Directory ' + targetDir + ' could not be created');
       process.exit(1);
   }
});

if (argv.resolution) {
  var matches = argv.resolution.match(pattern);

  resolution = { 'width': matches[1], 'height': matches[2] };
}

require('async').waterfall([
  function captureStep(done){
    if (!argv.capture){
      return done();
    }

    capture(url, targetDir, resolution, argv.quality, argv.format, argv.controls, argv.waitTime, argv.maxIndex, done);
  },
  function buildStep(done){
    build(targetDir, argv.output, argv.format, done);
  }
]);