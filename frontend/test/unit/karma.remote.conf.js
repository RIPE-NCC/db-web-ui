// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

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
    hostname: 'db-tools-1.ripe.net',
    port: 9003,
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-selenium-launcher'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../../reports/unittest-coverage'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml', 'coverage-istanbul'],
    colors: true,
    logLevel: config.LOG_INFO,
    singleRun: false,
    // autoWatch: true,
    customLaunchers: {
      selenium_chrome: {
        base: 'Selenium',
        config: webDriverConfig,
        name: 'Karma Test',
        browserName: 'chrome'
      }
    },
    browsers: ['selenium_chrome'],
    restartOnFileChange: true
  });
};
