/*
 * PhantomJS script to crawl a Reveal.js slide deck and capture each fragment as a PNG. 
 * Author: Katie Miller (codemiller)
 */

var page = require('webpage').create(),
    system = require('system');

if (system.args.length < 2 || system.args.indexOf("--help") > -1) {
    console.log('Pass the Reveal.js presentation URL as an argument, eg: phantomjs revealation.js http://lab.hakim.se/reveal-js\n\nOptionally, you can specify --captureAnimation to instruct Revealation to take extra frames of any CSS animations it detects (experimental), and/or add an integer argument to specify the maximum slide index to be used in frame ids (default 999)');
    phantom.exit(1);  
}

var url = system.args[1];
var captureAnimation = system.args.indexOf("--captureAnimation") > -1 || false;
var intRegex = /^\d+$/;
var maxSlideIndex = '999';
if (intRegex.test(system.args[3])) { maxSlideIndex = system.args[3] }
if (intRegex.test(system.args[2])) { maxSlideIndex = system.args[2] }

page.open(url, function(status) {
    if (status !== 'success') {
        console.log('Unable to load Reveal.js presentation at URL: ' + url);
        phantom.exit(1);
    }

    page.evaluate(function() {
        Reveal.configure({ controls: false, 
                           transition: 'none',
                           rollingLinks: false });
    });

    /* TODO This is causing funky results on fragment slides; commenting out for now.
    dims = getSlideDimensions(page);
    page.viewportSize = { width: dims.width, height: dims.height }; */
 
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
    var fragmentId = padWithZeroes(getFragmentIndex(page));
    if (captureAnimation) { 
        captureAnyAnimation(page, slideId, fragmentId);
    }
    renderFrame(page, slideId + '-' + fragmentId);
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
    return isLastSlide(page) && !hasNextFragment(page)
}

var hasFragments = function(page) {
    var fragments = getAvailableFragments(page);
    return fragments.prev || fragments.next; 
}

var hasNextFragment = function(page) {
    var fragments = getAvailableFragments(page);
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

var getAvailableFragments = function(page) {
    var result = doEval(page, function() {
        if (typeof(Reveal.availableFragments) === "function") {
            return Reveal.availableFragments();
        }
        return false;
    });
    if (result) { return result; }
    versionError();
}

var getSlideIndices = function(page) {
    return doEval(page, function() {
        return Reveal.getIndices();
    });
}

var getFragmentIndex = function(page) {
    return getSlideIndices(page).f || 0;
}

var getAnimation = function(page) {
    return doEval(page, function() {
        var fragments = Reveal.getCurrentSlide().getElementsByClassName("fragment");
        for (var i = 0; i < fragments.length; i++) {
            var aniName = window.getComputedStyle(fragments[i], null).getPropertyCSSValue("animation-name");
            var aniDuration = window.getComputedStyle(fragments[i], null).getPropertyCSSValue("animation-duration");
            var webkitAniName = window.getComputedStyle(fragments[i], null).getPropertyCSSValue("-webkit-animation-name");
            var webkitAniDuration = window.getComputedStyle(fragments[i], null).getPropertyCSSValue("-webkit-animation-duration");
            var classes = fragments[i].className;
            if (classes.indexOf("revealation-captured" == -1) && //TODO Fix; not working as expected
               ((aniName && aniName.cssText != "none") || (webkitAniName && webkitAniName.cssText != "none"))) {
                fragments[i].className += " revealation-captured revealation-animation";
               if (aniDuration && aniDuration.cssText) { return aniDuration.cssText; }
               if (webkitAniDuration && webkitAniDuration.cssText) { return webkitAniDuration.cssText; }
               return "2.5s"; 
            }
        }
        return false;
    });
}

//TODO This doesn't work as expected yet. Also, it would be nice to capture CSS transitions and GIFs.
var captureAnyAnimation = function(page, slideId, fragmentId) {
    var duration = getAnimation(page);
    if (duration) {
        console.log("Capturing animation for fragment " + slideId + "-" + fragmentId);
        var miliseconds = (duration.indexOf("ms") > -1) ? parseFloat(duration) : parseFloat(duration) * 1000; 
        var seriesFrames = miliseconds / 250; 
        for (var seriesId = 0; seriesId < seriesFrames; seriesId++) {
            doEval(page, function() {
                var animatedFragment = Reveal.getCurrentSlide().getElementsByClassName("revealation-animation")[0];
                window.setTimeout(function() {
                    if (animatedFragment) { animatedFragment.style.webkitAnimationPlayState = "paused"; }
                }, 250); // Doesn't work without setTimeout, but changing time here doesn't seem to have any effect
            });
            renderFrame(page, slideId + '-' + fragmentId + '-' + padWithZeroes(seriesId));
            doEval(page, function() {
                var animatedFragment = Reveal.getCurrentSlide().getElementsByClassName("revealation-animation")[0];
                if (animatedFragment) { animatedFragment.style.webkitAnimationPlayState = "running"; }
            });
        } 
        doEval(page, function() {
            var animatedFragment = Reveal.getCurrentSlide().getElementsByClassName("revealation-animation")[0];
            animatedFragment.className = animatedFragment.className.replace(/\brevealation-animation\b/,"");
        });
    }
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

var versionError = function() {
    console.log("Sorry, the version of Reveal.js used in the presentation is too old for this tool. Please upgrade it and try again.");
    phantom.exit();
}
