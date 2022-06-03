// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
    specs: ['./src/*e2e-spec.ts'],
    capabilities: {
        browserName: 'chrome',
        seleniumAddress: 'http://193.0.2.222:4444/wd/hub',
        chromeOptions: { args: ['--disable-extensions'] },
        acceptInsecureCerts: true,
    },
    framework: 'jasmine',
    allScriptsTimeout: 200000,

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print: function () {},
    },
    onPrepare() {
        require('ts-node').register({
            project: require('path').join(__dirname, './tsconfig.json'),
        });
        jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    },
};
