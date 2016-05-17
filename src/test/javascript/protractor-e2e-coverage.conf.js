exports.config = {
    //chromeDriver: '../lib/chromedriver',
    //seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',

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
        'seleniumAddress': 'http://193.0.2.222:4444/wd/hub',
        //'browserName': 'phantomjs',
        'chromeOptions': {'args': ['--disable-extensions']}
    },

    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: 'http://db-tools-1.ripe.net:9002',

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    }
};
