/*global angular, browser, document, exports*/

'use strict';

exports.config = {

    // Spec patterns are relative to the location of this config.
    specs: [
        './test/javascript/e2e/*Spec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
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
        var disableNgAnimate = function () {
            angular
                .module('disableNgAnimate', [])
                .run(['$animate', function ($animate) {
                    $animate.enabled(false);
                }]);
        };

        var disableCssAnimate = function () {
            angular
                .module('disableCssAnimate', [])
                .run(function () {
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
