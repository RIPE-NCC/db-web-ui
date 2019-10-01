Error.stackTraceLimit = Infinity;

require('core-js/es5');
require('core-js/es7/reflect');

require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/proxy');
require('zone.js/dist/sync-test');
require('zone.js/dist/jasmine-patch');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('ip-address/dist/ip-address-globals');

var testing = require('@angular/core/testing');
var browser = require('@angular/platform-browser-dynamic/testing');

// functions coming from template.ejs, needed for unit test
loadMatomo = (id) => {};
loadUsersnap = (id) => {};

testing.TestBed.initTestEnvironment(browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting());

var appContext = require.context('../../test/unit/', true, /\.spec\.ts/);
appContext.keys().forEach(appContext);
