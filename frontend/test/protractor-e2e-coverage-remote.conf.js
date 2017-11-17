/* global exports*/
'use strict';

exports.config = {

    // Spec patterns are relative to the location of this config.
    specs: [
        './test/e2e/*Spec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        'seleniumAddress': 'http://193.0.2.222:4444/wd/hub',
        'chromeOptions': {'args': ['--disable-extensions']}
    },
    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div
    getPageTimeout: 30000,

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: true,
        showColors: false,
        includeStackTrace: true,
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        var width = 1080;
        var height = 1000;
        browser.driver.manage().window().setSize(width, height);
    }

};
