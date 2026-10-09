// @ts-check
import json from '@eslint/json'
import stylisticJs from '@stylistic/eslint-plugin'
import gitignore from 'eslint-config-flat-gitignore'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginCommentLength from 'eslint-plugin-comment-length'
import importPlugin from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const allJsFiles = '**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
const naturalPerfectionistConfig = perfectionist.configs['recommended-natural']

export default defineConfig([
    {
        ignores: [
            'dist/',
            'node_modules/',
            '**/.next/',
            '**/build/*.js',
            '**/.cache/',
        ],
    },
    gitignore(),
    {
        ...json.configs.recommended,
        files: ['**/*.json'],
        language: 'json/json',
    },
    {
        files: [allJsFiles],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        ...eslintConfigPrettier,
        files: [allJsFiles],
    },
    {
        ...eslintPluginCommentLength.configs['flat/recommended'],
        files: [allJsFiles],
    },
    {
        ...naturalPerfectionistConfig,
        files: [allJsFiles],
        rules: {
            ...naturalPerfectionistConfig.rules,
            'perfectionist/sort-exports': 'error',
            'perfectionist/sort-imports': 'error',
            'perfectionist/sort-objects': 'error',
            'perfectionist/sort-sets': 'error',
        },
    },
    {
        files: [allJsFiles],
        plugins: {
            '@stylistic/js': stylisticJs,
            '@typescript-eslint': tseslint.plugin,
            import: importPlugin,
        },
        rules: {
            '@stylistic/js/multiline-comment-style': ['error', 'starred-block'],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-unused-expressions': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            eqeqeq: 'error',
            'import/no-anonymous-default-export': 'error',
            'linebreak-style': ['error', 'unix'],
            'max-nested-callbacks': 'error',
            'no-promise-executor-return': 'error',
            'no-var': 'error',
            'prefer-template': 'error',
        },
    },
])
