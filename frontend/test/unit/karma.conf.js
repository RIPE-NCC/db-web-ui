// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-spec-reporter'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../../../reports/unittest-coverage'),
            reports: ['html', 'lcovonly', 'text-summary'],
            fixWebpackSourcePaths: true,
        },
        reporters: ['spec', 'kjhtml', 'coverage-istanbul'],
        specReporter: {
            maxLogLines: 5, // limit number of lines logged per test
            suppressErrorSummary: false, // do not print error summary
            suppressFailed: false, // do not print information about failed tests
            suppressPassed: false, // do not print information about passed tests
            suppressSkipped: true, // do not print information about skipped tests
            showSpecTiming: false, // print the time elapsed for each spec
            failFast: false, // test would finish with error when a first fail occurs.
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        singleRun: false,
        // autoWatch: true,
        browsers: ['MyChromeHeadless'],
        customLaunchers: {
            MyChromeHeadless: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-setuid-sandbox', '--disable-translate', '--disable-extensions'],
            },
        },
        restartOnFileChange: true,
    });
};
