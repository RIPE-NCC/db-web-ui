/*global exports*/
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
    // rootElement: 'div',
    allScriptsTimeout: 200000,

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        var width = 1280;
        var height = 1000;
        browser.driver.manage().window().setSize(width, height);
    }
};
