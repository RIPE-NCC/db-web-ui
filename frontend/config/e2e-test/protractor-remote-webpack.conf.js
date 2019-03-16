const webpackConfig = require('./webpack.e2e');
const runner = require('protractor-webpack');

runner.run('./config/e2e-test/protractor-e2e-coverage-remote.conf.js', webpackConfig, 9002, webpackConfig.devServer);
