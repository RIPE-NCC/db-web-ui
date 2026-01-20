import * as prism from 'connect-prism';
import * as crypto from 'crypto';
import * as os from 'os';

const prismFilename = (config, req) => {
    const shasum = crypto.createHash('sha1');
    const url = req.url.replace('/db-web-ui/api', '/api');
    shasum.update(url);
    const digest = shasum.digest('hex');
    return digest + '.json';
};

prism.create({
    name: 'e2eTest',
    host: os.hostname(),
    port: 9002,
    https: false,
    mocksPath: './test/e2e/mocks',
    useApi: true,
    mode: 'mock',
    context: '/db-web-ui/api/',
    mockFilenameGenerator: prismFilename,
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
    mockFilenameGenerator: prismFilename,
});

export default prism.default.middleware;
