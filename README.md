Revealation
===========

This is a tool to help capture a [Reveal.js](https://github.com/hakimel/reveal.js) presentation and turn it into a PDF, which can then be uploaded to sites such as [SlideShare](http://www.slideshare.net). If the presentation you wish to convert is simple, you may find you get adequate output by adding the _print-pdf_ query parameter to the presentation URL, as described in [the Reveal.js docs](https://github.com/hakimel/reveal.js/blob/master/README.md#pdf-export), and printing to PDF that way. If however, your presentation has content that is overlayed on other content and revealed with fragments and/or you wish to show the fragments on your slides one by one in the PDF, this tool may provide a better solution.

## Prerequisites

- Install [PhantomJS](http://phantomjs.org) and make sure it is on your path 

## Install

- `npm install revealation`

## Run 

`node revealation.js http://myrevealpres.com`

## Options 

- `--capture` Capture the slides, but do not render to PDF
- `--build` Skip slide capture and build a PDF from images in the target directory 
- `--target {dir}` Directory to write the images and PDF
- `--output {filename}` Filename for the PDF (without an extension)
- `--resolution {1024x768}` Resolution for viewport; if unspecified, tool will use the Reveal.js slide dimensions
- `--quality {75}` Quality of images captured, from 0 to 100
- `--format {png}` Format of images captured: png or jpeg
- `--controls` Show the Reveal.js controls; defaults to false
- `--wait` Number of milliseconds to wait for each slide/fragment to load before capture
- `--maxindex {9999}` Maximum to use for frame indices; defaults to 9999
