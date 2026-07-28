import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist/**', 'docs/**', 'src/css/**', 'src/js/dialog-polyfill.esm.js']
    },
    js.configs.recommended,
    {
        files: ['src/**/*.js', 'build.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                jQuery: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none' }]
        }
    },
    {
        files: ['build.mjs'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    },
    {
        files: ['test/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser
            }
        }
    },
    prettier
];
