// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    'use strict';

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-cache-buster/angular-cache-buster.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/google-diff-match-patch/diff_match_patch.js',
            'bower_components/angular-diff-match-patch/angular-diff-match-patch.js',
            'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
            'bower_components/angular-loading-bar/build/loading-bar.js',
            'bower_components/angular-local-storage/dist/angular-local-storage.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/sifter/sifter.js',
            'bower_components/microplugin/src/microplugin.js',
            'bower_components/selectize/dist/js/selectize.js',
            'bower_components/angular-selectize2/dist/angular-selectize.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-ui-select/dist/select.js',
            'bower_components/waypoints/waypoints.js',
            'bower_components/SHA-1/sha1.js',
            'bower_components/angulartics/src/angulartics.js',
            'bower_components/angulartics/src/angulartics-adobe.js',
            'bower_components/angulartics/src/angulartics-chartbeat.js',
            'bower_components/angulartics/src/angulartics-cnzz.js',
            'bower_components/angulartics/src/angulartics-flurry.js',
            'bower_components/angulartics/src/angulartics-ga-cordova.js',
            'bower_components/angulartics/src/angulartics-ga.js',
            'bower_components/angulartics/src/angulartics-gtm.js',
            'bower_components/angulartics/src/angulartics-kissmetrics.js',
            'bower_components/angulartics/src/angulartics-mixpanel.js',
            'bower_components/angulartics/src/angulartics-piwik.js',
            'bower_components/angulartics/src/angulartics-scroll.js',
            'bower_components/angulartics/src/angulartics-segmentio.js',
            'bower_components/angulartics/src/angulartics-splunk.js',
            'bower_components/angulartics/src/angulartics-woopra.js',
            'bower_components/angulartics/src/angulartics-marketo.js',
            'bower_components/angulartics/src/angulartics-intercom.js',
            'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            'bower_components/ip-address/dist/ip-address-globals.js',
            'bower_components/json3/lib/json3.js',
            'bower_components/lodash/lodash.js',
            'bower_components/moment/moment.js',
            'bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'bower_components/angular-mocks/angular-mocks.js',
            // endbower
            'app/scripts/app.js',
            'app/scripts/**/*Module.js',
            'app/scripts/**/*States.js',
            'app/scripts/**/*.js',
            'test/javascript/unit/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        reporters: ['progress', 'coverage'],
        preprocessors: {
            'app/**/*.js': ['coverage']
        },

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
    });
};
