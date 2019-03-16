var webpackConfig = require('./webpack.test');
var os = require('os');
var webDriverConfig = {
    desiredCapabilities: {
        browserName: 'chrome',
    },
    host: '193.0.2.222',
    port: 4444,
    path: '/wd/hub'
};

module.exports = function (config) {
    config.set({
        hostname: os.hostname(),
        port: 9003,
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        frameworks: ['jasmine'],
        // list of files / patterns to load in the browser
        files: [
            {pattern: './karma-test-shim.js', watch: false}
        ],
        exclude: [],
        // preprocess matching files before serving them to the browser
        preprocessors: {
            './karma-test-shim.js': ['webpack', 'sourcemap']
        },
        webpack: webpackConfig,

        webpackMiddleware: {
        },

        webpackServer: {
            noInfo: true
        },

        reporters: ['progress', 'coverage', 'remap-coverage'],
        colors: true,
        logLevel: config.LOG_INFO,
        singleRun: true,
        customLaunchers: {
            selenium_chrome: {
                base: 'Selenium',
                config: webDriverConfig,
                name: 'Karma Test',
                browserName: 'chrome'
            }
        },
        browsers: ['selenium_chrome'],
        concurrency: Infinity,
        coverageReporter: {
            type: 'in-memory'
        },
        remapCoverageReporter: {
            'text-summary': null,
            json: './reports/coverage.json',
            html: './reports/unittest-coverage'
        },
    })
};
