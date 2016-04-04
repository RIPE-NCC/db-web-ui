exports.config = {
    seleniumAddress: null, //'http://localhost:4444/wd/hub',
    seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',
    localSeleniumStandaloneOpts: {
        // The port to start the Selenium Server on, or null if the server should
        // find its own unused port.
        port: null,
        // Additional command line options to pass to selenium. For example,
        // if you need to change the browser timeout, use
        // seleniumArgs: ['-browserTimeout=60']
        args: []
    },
    chromeDriver: '../lib/chromedriver',
    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    // Spec patterns are relative to the configuration file location passed
    // to protractor (in this example conf.js).
    // They may include glob patterns.
    specs: ['e2e/bogusSpec.js'],

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true // Use colors in the command line report.
    }
};
