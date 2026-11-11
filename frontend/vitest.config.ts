import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        // Jasmine use to restored spyOn() spies after every spec; keep that behaviour
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            // CI publishes frontend/coverage/lcov.info as an artifact for Sonar (see .gitlab-ci.yml)
            reportsDirectory: 'coverage',
            reporter: ['lcov', 'text-summary'],
            exclude: ['src/assets/**', 'test/**'],
        },
    },
});
