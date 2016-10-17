/* global exports*/

exports.config = {
    chromeDriver: '../lib/chromedriver_2.22',
    seleniumServerJar: '../lib/selenium-server-standalone-2.53.1.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        './src/test/javascript/e2e/*Spec.js'
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
