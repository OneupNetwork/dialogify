import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: [
            'dist/**',
            'docs/css/**',
            'docs/js/dialogify.min.js',
            'docs/js/custom-elements.min.js',
            'docs/js/dialog-polyfill.min.js',
            'src/css/**',
            'src/js/dialog-polyfill.esm.js'
        ]
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
    {
        files: ['docs/js/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                Dialogify: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none' }],
            'no-empty': ['error', { allowEmptyCatch: true }]
        }
    },
    prettier
];
