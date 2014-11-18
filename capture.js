var crawl = require('./crawl.js');
var Spooky = require('spooky');

module.exports = function (url, targetDir, resolution, imageQuality, imageFormat, showControls, waitTime, maxIndex, callback) {
    var env = process.env;

    // forwarding the path towards the local copy of PhantomJS
    env.PHANTOMJS_EXECUTABLE = require.resolve('casperjs/node_modules/.bin/phantomjs');

    var spookyOpts = {
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true,
            viewportSize: resolution ? resolution : null
        },
        child: {
            command: require.resolve('casperjs/bin/casperjs'),
            spawnOptions: {
                env: env
            }
        }
    };

    var spooky = new Spooky(spookyOpts, function (err) {
        if (err) {
            e = new Error('Failed to initialise SpookyJS');
            e.details = err;
            throw e;
        }

        spooky.start(url);
        testRevealVersion();
        if (!resolution) setResolution()
        configureReveal();
        crawl(spooky, targetDir, imageFormat, imageQuality, waitTime, maxIndex);

        spooky.run(function () {
            this.emit('finished');
            this.exit(0);
        });
    });

    spooky.on('error', function (e, stack) {
        console.error(e);
        if (stack) {
            console.log(stack);
        }
    });

    spooky.on('console', function (line) {
        console.log(line);
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });

    spooky.on('finished', function () {
        callback(null);
    });

    var testRevealVersion = function () {
        spooky.then(function () {
            var compatible = this.evaluate(function () {
                return typeof(Reveal.availableFragments) === 'function'
                    && typeof(Reveal.configure) === 'function'
                    && typeof(Reveal.getCurrentSlide) === 'function'
                    && typeof(Reveal.getIndices) === 'function'
                    && typeof(Reveal.isLastSlide) === 'function'
                    && typeof(Reveal.next) === 'function'
                    && typeof(Reveal.nextFragment) === 'function';
            });

            if (!compatible) {
                this.emit('console', 'This URL is invalid or the version of Reveal.js used in the presentation is too old for Revealation.');
                this.die('Fix URL or upgrade Reveal.js', 1);
            }
        });
    }

    var setResolution = function () {
        spooky.then(function () {
            var res = this.evaluate(function () {
                return { width: Reveal.getConfig().width,
                         height: Reveal.getConfig().height };
            });
            this.emit('console', 'Setting viewport resolution to ' + res.width + 'x' + res.height);
            this.viewport(res.width, res.height);
        });
    }

    var configureReveal = function () {
        spooky.thenEvaluate([{
            showControls: showControls
        }, function (showControls) {
            Reveal.configure({ controls: showControls,
                               transition: 'none',
                               rollingLinks: false });
        }]);
    }
}
