import { defineConfig } from 'cypress';

export default defineConfig({
    fixturesFolder: './test/cypress/fixtures',
    screenshotOnRunFailure: true,
    // recording costs a lot of CPU on CI; enable with CYPRESS_VIDEO=true when debugging
    video: false,
    videosFolder: './test/cypress/videos',
    screenshotsFolder: './test/cypress/screenshots',
    chromeWebSecurity: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
    defaultCommandTimeout: 10000,
    e2e: {
        setupNodeEvents(on, config) {},
        specPattern: './test/cypress/integration/**/*.e2e-spec.{js,jsx,ts,tsx}',
        supportFile: './test/cypress/support/index.ts',
        baseUrl: 'https://localhost.ripe.net:9002/db-web-ui',
    },
    retries: {
        runMode: 3,
        openMode: 0,
    },
});
