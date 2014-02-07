Revealation
===========

This is a tool to help capture a [Reveal.js](https://github.com/hakimel/reveal.js) presentation and turn it into a PDF, which can then be uploaded to sites such as [SlideShare](www.slideshare.net). If the presentation you wish to convert is simple, you may find you get adequate output by adding the _print-pdf_ query parameter to the presentation URL, as described in [the Reveal.js docs](https://github.com/hakimel/reveal.js/blob/master/README.md#pdf-export), and printing to PDF that way. If however, your presentation has content that is overlayed on other content and revealed with fragments and/or you wish to show the fragments on your slides one by one in the PDF, this tool may provide a better solution.

## Prerequisites

- Install [PhantomJS](http://phantomjs.org) and make sure the executable is on your path 
- Install [ImageMagick](http://www.imagemagick.org) and make sure the `convert` command is available on your path 

## Fully Automated Process

If you just want to convert the slide deck and don't care about removing any surplus slide captures, simply run the following command, replacing the URL with the URL of the desired target deck:

    ./revealation http://revealurl.example.com

## Manual Process 

If you want to review the slide images captured and remove any unwanted ones before creating the PDF, do the following:

- Run the command `phantomjs revealation.js http://revealurl.example.com`, replacing the URL with your own 
- Look at the PNG files in the directory and delete any unwanted ones; every Reveal.js fragment will be captured
- Run the command `convert *.png slides.pdf`

