/* global exports, require*/
var os = require('os');

var baseUrl = function() {
    'use strict';
    return [
        'http://',
        os.hostname(),
        ':9004'
    ].join('');
};

exports.config = {

    // Spec patterns are relative to the location of this config.
    specs: [
        './src/test/javascript/e2e/*Spec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        'seleniumAddress': 'http://193.0.2.222:4444/wd/hub',
        //'browserName': 'phantomjs',
        'chromeOptions': {'args': ['--disable-extensions']}
    },

    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: baseUrl(),

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: false,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    }
};
