/*global browser, document, exports*/

exports.config = {
    chromeDriver: '../lib/chromedriver',
    seleniumServerJar: '../lib/client-combined-3.0.1-nodeps.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        'e2e/*Spec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        //'browserName': 'phantomjs',
        'chromeOptions': {'args': ['--disable-extensions']}
    },
    directConnect: true,
    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    },

    onPrepare: function() {
        'use strict';

        var disableNgAnimate = function() {
            angular
                .module('disableNgAnimate', [])
                .run(['$animate', function($animate) {
                    $animate.enabled(false);
                }]);
        };

        var disableCssAnimate = function() {
            angular
                .module('disableCssAnimate', [])
                .run(function() {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = '* {' +
                        '-webkit-transition: none !important;' +
                        '-moz-transition: none !important' +
                        '-o-transition: none !important' +
                        '-ms-transition: none !important' +
                        'transition: none !important' +
                        '}';
                    document.getElementsByTagName('head')[0].appendChild(style);
                });
        };

        browser.addMockModule('disableNgAnimate', disableNgAnimate);
        browser.addMockModule('disableCssAnimate', disableCssAnimate);
    }
};
