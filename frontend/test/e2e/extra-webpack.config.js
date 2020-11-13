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
        before: function (app) {
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
            app.use(prism.middleware)
        },
    }
};
