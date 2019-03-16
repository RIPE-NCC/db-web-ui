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
        basePath: '../../',
        frameworks: ['jasmine'],
        files: [
            'webpack-dist/library.shared.*.js',
            'webpack-dist/vendorjs.bundle.*.js',
            'webpack-dist/ng1.bundle.*.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'config/unit-test/app-test.constants.js',
            'test/unit/**/*.js'
        ],
        exclude: [],
        preprocessors: {
            './*Spec.js': ['webpack'],
            'webpack-dist/**/*.js': ['coverage']
        },
        reporters: ['progress', 'coverage'],
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
        // optionally, configure the reporter
        coverageReporter: {
            type: 'lcov',
            dir: 'reports/unittest-coverage',
            reporters: [
                { type: 'lcov', subdir: './' },
                { type: 'clover', dir: 'reports/clover', subdir: '.', file: 'clover.xml' },
                { type: 'html', dir: 'reports/clover', subdir: '.', file: 'index.html' }
            ]
        }
    })
};
