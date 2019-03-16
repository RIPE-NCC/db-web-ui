const webpack = require('webpack');
const helpers = require('../helpers');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const TerserPlugin = require('terser-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const splitChunks = {
    cacheGroups: {
        commons: {
            chunks: 'all',
            name: 'library.shared',
            test: /[\\/]node_modules[\\/]/,
        },
        default: false
    }
};

module.exports = {
    entry: {
        'polyfills': './app/polyfills.ts',
        'vendor': './app/vendor-aot.ts',
        'vendorjs': './app/vendor-js.ts',
        'ng2': './app/main-aot.ts',
        'ng1': './app/index.ts'
    },
    mode: ENV,
    output: {
        path: helpers.root('webpack-dist'),
        publicPath: '/db-web-ui',
        filename: '[name].bundle.[contenthash].js',
        chunkFilename: '[id].[contenthash].js'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },
    optimization: {
        splitChunks,
        namedChunks: true,
        minimizer: [new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: false,
            terserOptions: {mangle: false}
        })],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: ['angular2-template-loader','@ngtools/webpack'],
            },
            {
                test: /\.html$/,
                loader: 'raw-loader', // do not inline html inside js
                exclude: [helpers.root('./config/index.html')]
            },
            {
                test: /\.(png|svg|gif)$/,
                loader: 'url-loader?limit=25000'
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    }, {
                        loader: "css-loader",
                    }, {
                        loader: "sass-loader",
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    }, {
                        loader: "css-loader",
                    }
                ]
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-compiled-loader',
            }]
    },

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
            // copy all html files to let CrowdTokenFilter do its job
            {
                from: './app/scripts/**/*.html',
                to: './scripts/',
                transformPath (targetPath, absolutePath) {
                    return targetPath.replace('scripts/app/scripts', 'scripts');
                }
            }
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                'ENV': JSON.stringify(ENV)
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
        new webpack.ProvidePlugin({
            diff_match_patch: 'diff-match-patch',
            CryptoJS: 'crypto-js',
            moment: 'moment',
            Address4: ['ip-address', 'Address4'],
            Address6: ['ip-address', 'Address6']
        }),
        new AngularCompilerPlugin({
            tsConfigPath: './tsconfig.aot.json',
            entryModule: './app/ng2/app.module#AppModule',
            sourceMap: false,
            skipCodeGeneration: false
        }),
    ],
};
