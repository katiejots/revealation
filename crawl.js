module.exports = function (spooky, targetDir, imageFormat, imageQuality, waitTime, maxIndex) {
    spooky.then([{ baseDir: targetDir,
                   format: imageFormat,
                   quality: imageQuality,
                   waitTime: waitTime,
                   maxIndex: maxIndex
    }, function () {

        var captureFrame = function (casper, imageName) {
            var filename = baseDir + '/' + imageName + '.' + format;
            casper.capture(filename, undefined, {
                format: format,
                quality: quality 
            });
        }

        var buildFrameId = function (hSlideIndex, vSlideIndex, fragmentIndex) {
            var slideId = padWithZeroes(hSlideIndex) + '-' + padWithZeroes(vSlideIndex);; 
            var fragmentId = padWithZeroes(fragmentIndex);
            return 'frame' + '-' + slideId + '-' + fragmentId;
        };

        var padWithZeroes = function (num) {
            var numDigits = maxIndex.toString().length;
            if (num <= maxIndex) {
                num = (new Array(numDigits).join('0') + num).slice(-numDigits);
            }   
            return num;
        };

        var getAvailableFragments = function (casper) {
            return casper.evaluate(function () {
                return Reveal.availableFragments();
            });
        };

        var getSlideIndices = function (casper) {
            return casper.evaluate(function () {
                return Reveal.getIndices();
            });
        };

        var getFragmentIndex = function (casper) {
            return getSlideIndices(casper).f || 0;
        };

        var forceRepaint = function (casper) {
            casper.evaluate(function () {
                // Hack from http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
                var curSlide = document.getElementsByClassName('present')[0];
                curSlide.style.display = 'none';
                curSlide.offsetHeight;
                curSlide.style.display = 'block';
            });
        };

        var hasFragments = function (casper) {
            var fragments = getAvailableFragments(casper);
            return fragments.prev || fragments.next;
        };

        var hasNextFragment = function (casper) {
            var fragments = getAvailableFragments(casper);
            return fragments.next;
        };

        var nextSlide = function (casper) {
            casper.evaluate(function () {
                Reveal.next();
            });
        };

        var nextFragment = function (casper) {
            casper.evaluate(function () {
                Reveal.nextFragment();
            });
            forceRepaint(casper);
        };

        var isLastSlide = function (casper) {
            return casper.evaluate(function () {
                return Reveal.isLastSlide();
            });
        };

        var isPresDone = function (casper) {
            return isLastSlide(casper) && !hasNextFragment(casper);
        };

        var advancePres = function (casper) {
            if (hasNextFragment(casper)) {
                nextFragment(casper);
            } else {
                nextSlide(casper);
            }
        };
        
        var getFrameId = function (casper) {
            var slideIndices = getSlideIndices(casper);
            var fragmentIndex = getFragmentIndex(casper); 
            return buildFrameId(slideIndices.h, slideIndices.v, fragmentIndex);
        }

        var advance = function (casper, waitTime) {
            casper.wait(waitTime, function () { 
                captureFrame(casper, getFrameId(casper));
                advancePres(casper);
                if (!isPresDone(casper)) {
                    advance(casper, waitTime); 
                } else {
                    captureFrame(casper, getFrameId(casper));
                }
            });
        }

        advance(this, waitTime);
    }]);
}
