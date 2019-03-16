module.exports = function (config) {
    config.set({
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
        browsers: ['Chrome'],
        singleRun: true,
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
