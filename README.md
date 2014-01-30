A script to help generate PDF versions of Reveal.js HTML slide decks
=======
Revealation
===========

This is a script to help capture a [Reveal.js](https://github.com/hakimel/reveal.js) presentation and turn it into a PDF, which can then be uploaded to sites such as [SlideShare](www.slideshare.net). If the presentation you wish to convert is simple, you may find you get acceptable output by adding the _print-pdf_ query parameter to the presentation URL, as described in the Reveal.js docs, and printing to PDF that way. If however, your presentation has content that is overlayed on other content and revealed with fragments and/or you wish to show the fragments on your slides one by one in the PDF, this script may provide a better solution.

- Install [PhantomJS](http://phantomjs.org) and make sure the executable is on your path 
- Install [ImageMagick](www.imagemagick.org) and make sure the `convert` command is available on your path 
- Run the command `phantomjs revealation.js http://revealurl.example.com`, replacing the URL with your own 
- Look at the PNG files in the directory and delete any unwanted ones; every Reveal.js fragment will be captured
- Run the command `convert *.png slides.pdf`

