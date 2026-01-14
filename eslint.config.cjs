const js = require('@eslint/js');
const vue = require('eslint-plugin-vue');
const prettier = require('eslint-config-prettier');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: [
      'dist',
      'node_modules',
      'commitlint.config.cjs',
      '.husky/**',
      '.vscode/**',
      '.stylelintrc.cjs',
      '.stylelintignore',
      '.prettierrc.json',
      '.prettierignore',
      'package-lock.json',
      'pnpm-lock.yaml',
      'eslint.config.cjs',
      'vite.config.ts',
    ],
  },

  // 基础 JS 规则
  js.configs.recommended,

  // Vue 3 推荐规则（flat）
  ...vue.configs['flat/recommended'],

  // 关闭与 Prettier 冲突的规则
  prettier,

  // 解析 .vue 中的 TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {},
  },

  // TypeScript 支持
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },

  // 项目定制
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      // 关闭 TypeScript 未使用变量的检查
      '@typescript-eslint/no-unused-vars': 'off',
      // 关闭基础 JavaScript 未使用变量的检查（适用于 .js, .vue 等文件）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];
