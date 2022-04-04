const os = require('os');
const prism = require('connect-prism');

const prismFilename = (config, req) => {
    const crypto = require('crypto');
    const shasum = crypto.createHash('sha1');
    const url = req.url.replace('/db-web-ui/api', '/api');
    shasum.update(url);
    const digest = shasum.digest('hex');
    return digest + '.json';
};

module.exports = {
    module: {
        rules: [
            {
                test: /node_modules\/@technical-design/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                },

            }
        ]
    },
    devServer: {
        setupMiddlewares: function (middlewares, devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }
            prism.create({
                name: 'e2eTest',
                host: os.hostname(),
                port: 9002,
                https: false,
                mocksPath: './test/e2e/mocks',
                useApi: true,
                mode: 'mock',
                context: '/db-web-ui/api',
                mockFilenameGenerator: prismFilename
            });
            prism.create({
                name: 'e2eTestAppConstants',
                host: os.hostname(),
                port: 9002,
                https: false,
                mocksPath: './test/e2e/mocks',
                useApi: true,
                mode: 'mock',
                context: '/db-web-ui/app.constants.json',
                mockFilenameGenerator: prismFilename
            });
            middlewares.push(prism.middleware)
            return middlewares;
        },
    }
};
