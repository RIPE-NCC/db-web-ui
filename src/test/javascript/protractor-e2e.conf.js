exports.config = {
    chromeDriver: '../lib/chromedriver',
    seleniumServerJar: '../lib/selenium-server-standalone-2.53.1.jar',

    // Spec patterns are relative to the location of this config.
    specs: [
        'e2e/*Spec.js'
        //'e2e/createOrganisationSpec.js'
        //'e2e/modifyAutNumSpec.js',
        //'e2e/modifyRipeResourceSpec.js'
        //'e2e/navigateToObjectCreationSpec.js'
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
        // If the window isn't big enough you might see exceptions relating to elements being 'not visible'
        //browser.manage().window().setSize(1200, 1080);
    }

};
