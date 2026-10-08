import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
    ...tseslint.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        ignores: ['dist/'],
    },
    {
        name: 'glow-default',
        files: ['**/*'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            eqeqeq: 'error',
            indent: ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'multiline-comment-style': ['error', 'starred-block'],
            'no-var': 1,
            'prefer-template': 'error',
            'prettier/prettier': 'error',
        },
    },
)
