/*
 * PhantomJS script to crawl a Reveal.js slide deck and capture each fragment as a PNG. 
 * Author: Katie Miller (codemiller)
 */

var page = require('webpage').create(),
    system = require('system');

if (system.args.length === 1) {
    console.log('Pass the Reveal.js presentation URL as an argument, eg: phantomjs revealation.js http://lab.hakim.se/reveal-js');
    phantom.exit(1);  
}

var url = system.args[1];
var maxSlideIndex = system.args[2] || '999';

page.open(url, function(status) {
    if (status !== 'success') {
        console.log('Unable to load Reveal.js presentation at URL: ' + url);
        phantom.exit(1);
    }

    dims = getSlideDimensions(page);
    page.viewportSize = { width: dims.width, height: dims.height };
    page.paperSize = { width: dims.width, height: dims.height, margin: '0px' }

    page.evaluate(function() {
        Reveal.configure({ controls: false, 
                           transition: 'none',
                           rollingLinks: false });
    });

    for (var done = false; !done; done = isPresDone(page)) { 
        var slideIndices = getSlideIndices(page); 
        var slideId = padWithZeroes(slideIndices.h) + '-' + padWithZeroes(slideIndices.v);

        doRender(page, slideId); 
        advancePres(page);
    }

    phantom.exit();
});

var advancePres = function(page) {
    if (hasNextFragment(page)) {
        nextFragment(page);
    } else {
        nextSlide(page);
    }
}

var doRender = function(page, slideId) {
    //TODO: Detect if animation and capture accordingly
    var fragmentId = getFragmentIndex(page);
    renderFrame(page, slideId + '-' + padWithZeroes(fragmentId));
}

var renderFrame = function(page, id) {
    page.render('frame-' + id + '.png'); 
}

var doEval = function(page, func) {
    return page.evaluate(func);
} 

var isLastSlide = function(page) {
    return doEval(page, function() {
        return Reveal.isLastSlide();
    });
}

var isPresDone = function(page) {
    return isLastSlide(page) && !hasFragments(page)
}

var hasFragments = function(page) {
    var fragments = getSlideFragments(page);
    return fragments.prev || fragments.next; 
}

var hasNextFragment = function(page) {
    var fragments = getSlideFragments(page);
    return fragments.next; 
}

var nextSlide = function(page) {
    doEval(page, function() {
        Reveal.next();
    });
}

var nextFragment = function(page) {
    doEval(page, function() {
        Reveal.nextFragment();
    });
    forceRepaint(page);
}

var getSlideDimensions = function(page) {
    return doEval(page, function() {
        return { width: Reveal.getConfig().width,
                 height: Reveal.getConfig().height }
    });
}

var getSlideFragments = function(page) {
    return doEval(page, function() {
        return Reveal.availableFragments();
    });
}

var getSlideIndices = function(page) {
    return doEval(page, function() {
        return Reveal.getIndices();
    });
}

var getFragmentIndex = function(page) {
    return getSlideIndices(page).f || 0;
}

var forceRepaint = function(page) {
    doEval(page, function() { 
        // Hack from http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
        var curSlide = document.getElementsByClassName('present')[0];
        curSlide.style.display = 'none';
        curSlide.offsetHeight;
        curSlide.style.display = 'block';
    });
}

var padWithZeroes = function(num) {
    var numDigits = maxSlideIndex.toString().length; 
    if (num <= maxSlideIndex) { 
        num = (Array(numDigits).join("0") + num).slice(-numDigits) 
    }
    return num;
}

