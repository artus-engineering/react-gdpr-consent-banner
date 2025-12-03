import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jest from 'eslint-plugin-jest'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                JSX: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript,
            react,
            'react-hooks': reactHooks,
            jest,
            'jsx-a11y': jsxA11y
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            ...typescript.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'warn',
            'no-var': 'error',
            'object-shorthand': 'warn',
            'prefer-arrow-callback': 'warn',
            'jsx-a11y/no-static-element-interactions': [
                'warn',
                {
                    handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp']
                }
            ],
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/no-noninteractive-element-interactions': 'warn',
            'react/no-unknown-property': ['error', { ignore: ['stroke-width', 'stroke-linecap', 'stroke-linejoin'] }]
        }
    },
    {
        files: ['**/*.test.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            globals: {
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                vi: 'readonly',
                require: 'readonly'
            }
        },
        rules: {
            ...jest.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-undef': 'off'
        }
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/no-empty-object-type': 'off'
        }
    },
    {
        files: ['scripts/**/*.js', '**/*.config.js'],
        languageOptions: {
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                console: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'no-console': 'off'
        }
    },
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'example/**',
            'test-install/**',
            '**/.next/**',
            '**/coverage/**',
            '**/build/**',
            '**/*.tgz',
            '**/pnpm-lock.yaml',
            '**/package-lock.json',
            '**/yarn.lock',
            '**/*.config.js',
            '**/*.config.ts'
        ]
    },
    prettier
]
