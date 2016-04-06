exports.config = {
    //directConnect: true,
    chromeDriver: '../lib/chromedriver',
    seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        'e2e/bogusSpec.js'
    ],

    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {'args': ['--disable-extensions']}
    },

    framework: 'jasmine2',
    rootElement: 'div', // test everything inside the 1st div

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: 'http://localhost:9000',

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 10000
    }
};
