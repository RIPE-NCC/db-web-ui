var webpackConfig = require('./webpack.test');

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        frameworks: ['jasmine'],
        // list of files / patterns to load in the browser
        files: [
            {pattern: './karma-test-shim.js', watch: false},
        ],
        exclude: [],
        // preprocess matching files before serving them to the browser
        preprocessors: {
            './karma-test-shim.js': ['webpack', 'sourcemap'],
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
        singleRun: false,
        browsers: ['Chrome'],
        concurrency: Infinity,
        coverageReporter: {
            type: 'in-memory'
        },
        remapCoverageReporter: {
            'text-summary': null,
            json: './reports/coverage.json',
            html: './reports/unittest-coverage'
        }
    })
};
