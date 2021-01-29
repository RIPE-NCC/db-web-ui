// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
  specs: [
    './src/*e2e-spec.ts',
  ],
  capabilities: {
    'browserName': 'firefox',
    'acceptInsecureCerts' : true,
    'moz:firefoxOptions': {binary: '/Users/isvonja/Desktop/FirefoxBeta84.app'}
  },
  directConnect: true,
  framework: 'jasmine',
  allScriptsTimeout: 300000,

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 70000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
