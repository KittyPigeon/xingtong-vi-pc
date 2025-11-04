const js = require('@eslint/js');
const vue = require('eslint-plugin-vue');
const prettier = require('eslint-config-prettier');

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
      'vite.config.js',
    ],
  },

  // 基础 JS 规则
  js.configs.recommended,

  // Vue 3 推荐规则（flat）
  ...vue.configs['flat/recommended'],

  // 关闭与 Prettier 冲突的规则
  prettier,

  // 项目定制
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
