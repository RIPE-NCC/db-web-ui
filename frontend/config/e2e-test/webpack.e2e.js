const os = require('os');
const webpack = require('webpack');
const helpers = require('../helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackDev = require('../webpack-dev/webpack.dev');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'development';

var prismFilename = function (config, req) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    shasum.update(req.url);
    var digest = shasum.digest('hex');
    return digest + '.json';
};

var prism = require('connect-prism');


module.exports = {

    entry: webpackDev.entry,
    output: {
        path: helpers.root('webpack-dist'),
        publicPath: '/db-web-ui',
        filename: '[name].bundle.[contenthash].js',
        chunkFilename: '[id].[contenthash].js'
    },
    resolve: webpackDev.resolve,
    module: webpackDev.module,
    optimization: webpackDev.optimization,
    mode: 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: '!!ejs-compiled-loader!config/template.ejs',
            inject: false,
            chunksSortMode: helpers.sortChunk([
                'library.shared',
                'vendorjs',
                'vendor',
                'ng1',
                'polyfills',
                'ng2',
            ])
        }),
        new CopyWebpackPlugin([
            // copy the files that are not template and webpack doesn't know about them (without app on destination)
            {
                from: './app/scripts/whoisObject/attribute-reverse-zones.html',
                to: './scripts/whoisObject/attribute-reverse-zones.html'
            },
            {
                from: './app/scripts/whoisObject/attribute.html',
                to: './scripts/whoisObject/attribute.html'
            },
            {
                from: './app/scripts/app.constants.ts',
                to: './scripts/app.constants.js'
            }
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new webpack.ProvidePlugin({
            diff_match_patch: 'diff-match-patch',
            CryptoJS: 'crypto-js',
            moment: 'moment',
            Address4: ['ip-address', 'Address4'],
            Address6: ['ip-address', 'Address6']
        }),
    ],

    devServer: {
        before: function (app) {
            prism.create({
                name: 'e2eTest',
                host: os.hostname(),
                port: 9002,
                https: false,
                mocksPath: './test/e2e/mocks',
                useApi: true,
                mode: 'mock',
                context: '/api',
                mockFilenameGenerator: prismFilename
            });

            app.use(prism.middleware)
        },
        disableHostCheck: true,
        port: 9002,
        publicPath: '/db-web-ui/',
        contentBase: 'webpack-dist/',
        proxy: {
            '/db-web-ui/api/**': {
                target: 'http://' + os.hostname() + ':9002',
                secure: false,
                pathRewrite: {
                    '/db-web-ui/': '/'
                }
            }
        }
    }
};
