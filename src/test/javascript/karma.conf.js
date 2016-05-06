// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            // bower:js
            'main/webapp/bower_components/modernizr/modernizr.js',
            'main/webapp/bower_components/jquery/dist/jquery.js',
            'main/webapp/bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            'main/webapp/bower_components/json3/lib/json3.js',
            'main/webapp/bower_components/angular/angular.js',
            'main/webapp/bower_components/angular-ui-router/release/angular-ui-router.js',
            'main/webapp/bower_components/angular-resource/angular-resource.js',
            'main/webapp/bower_components/angular-cookies/angular-cookies.js',
            'main/webapp/bower_components/angular-sanitize/angular-sanitize.js',
            'main/webapp/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
            'main/webapp/bower_components/angular-local-storage/dist/angular-local-storage.js',
            'main/webapp/bower_components/angular-cache-buster/angular-cache-buster.js',
            'main/webapp/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
            'main/webapp/bower_components/lodash/lodash.js',
            'main/webapp/bower_components/waypoints/waypoints.js',
            'main/webapp/bower_components/SHA-1/sha1.js',
            'main/webapp/bower_components/angulartics/src/angulartics.js',
            'main/webapp/bower_components/angulartics/src/angulartics-adobe.js',
            'main/webapp/bower_components/angulartics/src/angulartics-chartbeat.js',
            'main/webapp/bower_components/angulartics/src/angulartics-cnzz.js',
            'main/webapp/bower_components/angulartics/src/angulartics-flurry.js',
            'main/webapp/bower_components/angulartics/src/angulartics-ga-cordova.js',
            'main/webapp/bower_components/angulartics/src/angulartics-ga.js',
            'main/webapp/bower_components/angulartics/src/angulartics-gtm.js',
            'main/webapp/bower_components/angulartics/src/angulartics-kissmetrics.js',
            'main/webapp/bower_components/angulartics/src/angulartics-mixpanel.js',
            'main/webapp/bower_components/angulartics/src/angulartics-piwik.js',
            'main/webapp/bower_components/angulartics/src/angulartics-scroll.js',
            'main/webapp/bower_components/angulartics/src/angulartics-segmentio.js',
            'main/webapp/bower_components/angulartics/src/angulartics-splunk.js',
            'main/webapp/bower_components/angulartics/src/angulartics-woopra.js',
            'main/webapp/bower_components/angulartics/src/angulartics-marketo.js',
            'main/webapp/bower_components/angulartics/src/angulartics-intercom.js',
            'main/webapp/bower_components/sifter/sifter.js',
            'main/webapp/bower_components/microplugin/src/microplugin.js',
            'main/webapp/bower_components/selectize/dist/js/selectize.js',
            'main/webapp/bower_components/angular-selectize2/dist/selectize.js',
            'main/webapp/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'main/webapp/bower_components/angular-ui-select/dist/select.js',
            'main/webapp/bower_components/google-diff-match-patch/diff_match_patch.js',
            'main/webapp/bower_components/angular-diff-match-patch/angular-diff-match-patch.js',
            'main/webapp/bower_components/angular-loading-bar/build/loading-bar.js',
            'main/webapp/bower_components/moment/moment.js',
            'main/webapp/bower_components/angular-mocks/angular-mocks.js',
            // endbower
            'main/webapp/scripts/app/app.js',
            'main/webapp/scripts/app/**/*Module.js',
            'main/webapp/scripts/app/**/*States.js',
            'main/webapp/scripts/app/**/*.js',
            'test/javascript/unit/**/*.js'
        ],


        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 9876,

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
            'main/webapp/scripts/app/**/*.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            type: 'lcov',
            dir: '../reports/unittest-coverage',
            reporters: [
                {type: 'html', subdir: 'html-report'},
                {type: 'json', subdir: './', file: 'coverage.json'}
            ]
        }
    });

};
