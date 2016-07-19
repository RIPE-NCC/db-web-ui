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
    chromeDriver: '../lib/chromedriver',
    seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        './src/test/javascript/e2e/*Spec.js'
        //'**/e2e/createOrganisationSpec.js'
        //'e2e/modifyAutNumSpec.js',
        //'e2e/modifyRipeResourceSpec.js'
        //'e2e/navigateToObjectCreationSpec.js
    ],

    capabilities: {
        'browserName': 'chrome',
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
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    }
};
