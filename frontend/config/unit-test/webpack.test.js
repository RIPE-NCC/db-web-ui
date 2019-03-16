const helper = require('../helpers');
const ENV = process.env.NODE_ENV = process.env.ENV = 'development';

module.exports = {
    devtool: "sourcemap",
    mode: ENV,
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                enforce: 'post',
                test: /\.ts$/,
                loader: 'istanbul-instrumenter-loader',
                include: helper.root('app'),
                exclude: /(node_modules)/,
            }
        ]
    },
};
