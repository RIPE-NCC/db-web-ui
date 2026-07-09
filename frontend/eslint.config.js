const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        ignores: ['projects/**/*'],
    },
    {
        files: ['**/*.ts'],
        extends: [...angular.configs.tsRecommended],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                project: ['tsconfig.json', 'e2e/tsconfig.json'],
                createDefaultProgram: true,
            },
        },
        rules: {
            '@angular-eslint/component-selector': 'off',
            '@angular-eslint/directive-selector': 'off',
            '@angular-eslint/no-input-rename': 'error',
            '@angular-eslint/no-output-rename': 'error',
            // TODO remove this ASAP, from here to bottom of rules
            // Keep the old project behaviour
            '@angular-eslint/prefer-on-push-component-change-detection': 'off',

            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',

            'no-useless-escape': 'off',
            'no-prototype-builtins': 'off',
            'no-unused-vars': 'off',
            'no-undef': 'off', // probably unnecessary once globals are configured
            'no-empty': 'off',
            'no-control-regex': 'off',
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {},
    },
);
