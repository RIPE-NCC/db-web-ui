import { defineConfig } from 'cypress';

export default defineConfig({
    fixturesFolder: './test/cypress/fixtures',
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: './test/cypress/videos',
    screenshotsFolder: './test/cypress/screenshots',
    chromeWebSecurity: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
    e2e: {
        setupNodeEvents(on, config) {},
        specPattern: './test/cypress/integration/**/*.e2e-spec.{js,jsx,ts,tsx}',
        supportFile: './test/cypress/support/index.ts',
        baseUrl: 'https://localhost.ripe.net:9002/db-web-ui',
    },
});
