/*
 * Tool to crawl a Reveal.js slide deck and capture each fragment to build a PDF.
 * Author: Katie Miller (codemiller)
 */

var fs = require('fs'),
build = require ('./build.js'),
capture = require ('./capture.js'),
argv = require('minimist')(process.argv.slice(2)),
url = argv._[0],
mode,
targetDir = argv.target || 'output',
outputFilename = argv.output || 'presentation',
resolution,
imageQuality = argv.quality || 100,
imageFormat = argv.format || 'png',
showControls = argv.controls || false,
waitTime = argv.wait || 1000,
maxIndex = argv.maxindex || 999;

if ((argv.capture != argv.build) && argv.capture) {
    mode = 'capture';
    console.log('Mode set to capture: capturing slides only');
} else if ((argv.capture != argv.build) && argv.build) {
    mode = 'build';
    console.log('Mode set to build: building PDF only');
} else {
    mode = 'full';
}

if (mode !== 'build') {
    // Process command line arguments for capture
    if (argv.resolution) {
        var res = argv.resolution;
        var pattern = /(\d+)x(\d+)/;
        if (typeof res === 'string' && res.match(pattern)) {
           var matches = res.match(pattern);
           resolution = { 'width': matches[1], 'height': matches[2] }; 
        } else {
            console.log('Resolution must have format {height}x{width}');
            process.exit(1);
        }
    }

    if (!url || (imageFormat !== 'png' && imageFormat !== 'jpeg') ||
      waitTime !== parseInt(waitTime) ||
      maxIndex !== parseInt(maxIndex) ||
      imageQuality !== parseInt(imageQuality)) {
        console.log('Argument error\nExample use: node revealation.js http://myrevealpres.com --format jpeg');
        process.exit(1);
    }

    fs.mkdir(targetDir, '0777', function (err) {
       if (err && err.code != 'EEXIST') {
           console.log('Directory ' + targetDir + ' could not be created');
           process.exit(1);
       } 
    });
}

var builder = function () {
    build(targetDir, outputFilename, imageFormat, function (err) {
        if (err) {
            console.log('Could not build PDF: ' + err);
            process.exit(1);
        }
    });
}

if (mode !== 'build') {
    capture(url, targetDir, resolution, imageQuality, imageFormat, showControls, waitTime, maxIndex, function(err) {
        if (err) {
            console.log('Could not capture slides: ' + err);
            process.exit(1);
        } 
        builder();
    });
} else {
    builder();
}
