/* global exports*/

exports.config = {
    chromeDriver: '../lib/chromedriver',
    seleniumServerJar: '../lib/client-combined-3.0.1-nodeps.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        './test/javascript/e2e/*Spec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        //'browserName': 'phantomjs',
        'chromeOptions': {'args': ['--disable-extensions']}
    },

    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    }
};
