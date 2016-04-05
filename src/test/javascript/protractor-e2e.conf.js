exports.config = {
    // The address of a running selenium server.
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',

    // Spec patterns are relative to the location of this config.
    specs: ['e2e/bogusSpec.js'],

    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {'args': ['--disable-extensions']}
    },


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

// exports.config = {
//     //seleniumAddress: 'http://localhost:4444/wd/hub',
//     seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',
//     localSeleniumStandaloneOpts: {
//         //      // The port to start the Selenium Server on, or null if the server should
//         //      // find its own unused port.
//         //      port: 57739
//         //      // Additional command line options to pass to selenium. For example,
//         //      // if you need to change the browser timeout, use
//         //seleniumArgs: ['-browserTimeout=60']
//         //      args: []
//     },
//     //chromeDriver: '../lib/chromedriver',
//     // An example configuration file.
//     directConnect: true,
//
//     // Capabilities to be passed to the webdriver instance.
//     capabilities: {
//         'browserName': 'chrome'
//     },
//
//     // Framework to use. Jasmine 2 is recommended.
//     framework: 'jasmine2',
//
//     // Spec patterns are relative to the current working directly when
//     // protractor is called.
//     specs: ['e2e/bogusSpec.js'],
//
//     // Options to be passed to Jasmine.
//     jasmineNodeOpts: {
//         defaultTimeoutInterval: 30000,
//         showColors: true // Use colors in the command line report.
//     }
//
// // seleniumAddress: null, //'http://localhost:9000/index_test.html', //'http://localhost:4444/wd/hub',
//     // seleniumServerJar: '../lib/selenium-server-standalone-2.47.1.jar',
//     // localSeleniumStandaloneOpts: {
//     //     // The port to start the Selenium Server on, or null if the server should
//     //     // find its own unused port.
//     //     port: null,
//     //     // Additional command line options to pass to selenium. For example,
//     //     // if you need to change the browser timeout, use
//     //     // seleniumArgs: ['-browserTimeout=60']
//     //     args: []
//     // },
//     // chromeDriver: '../lib/chromedriver',
//     // // Capabilities to be passed to the webdriver instance.
//     // capabilities: {
//     //     'browserName': 'chrome'
//     // },
//     //
//     // // Spec patterns are relative to the configuration file location passed
//     // // to protractor (in this example conf.js).
//     // // They may include glob patterns.
//     // specs: ['e2e/bogusSpec.js'],
//     //
//     // // Options to be passed to Jasmine-node.
//     // jasmineNodeOpts: {
//     //     showColors: true // Use colors in the command line report.
//     // }
// };

