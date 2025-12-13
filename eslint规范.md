# ESLint 配置增强 - 增加常用规则

以下是增强后的 ESLint 配置，增加了大量实用规则：

```javascript
const js = require('@eslint/js');
const vue = require('eslint-plugin-vue');
const prettier = require('eslint-config-prettier');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const promisePlugin = require('eslint-plugin-promise');
const nPlugin = require('eslint-plugin-n');
const unicornPlugin = require('eslint-plugin-unicorn');

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
      'coverage/**',
      '*.log',
      '*.tmp',
      '*.min.js',
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
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        AbortController: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        PerformanceObserver: 'readonly',
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
        project: './tsconfig.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        AbortController: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        PerformanceObserver: 'readonly',
        __DEV__: 'readonly',
        __PROD__: 'readonly',
        __TEST__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },

  // 项目定制 - 通用规则
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        AbortController: 'readonly',
        IntersectionObserver: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        PerformanceObserver: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      unicorn: unicornPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    },
    rules: {
      // ============ Vue 相关规则 ============
      'vue/multi-word-component-names': 'off', // 允许单个单词的组件名
      'vue/no-v-html': 'warn', // 谨慎使用 v-html
      'vue/require-default-prop': 'off', // 不要求必须设置默认值
      'vue/require-prop-types': 'error', // 要求定义 props 类型
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'RENDER_MODIFIERS',
            'GLOBAL',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'OTHER_ATTR',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      'vue/order-in-components': [
        'error',
        {
          order: [
            'el',
            'name',
            'key',
            'parent',
            'functional',
            ['delimiters', 'comments'],
            ['components', 'directives', 'filters'],
            'extends',
            'mixins',
            ['provide', 'inject'],
            'ROUTER_GUARDS',
            'layout',
            'middleware',
            'validate',
            'scrollToTop',
            'transition',
            'loading',
            'inheritAttrs',
            'model',
            ['props', 'propsData'],
            'emits',
            'setup',
            'asyncData',
            'data',
            'fetch',
            'head',
            'computed',
            'watch',
            'watchQuery',
            'LIFECYCLE_HOOKS',
            'methods',
            ['template', 'render'],
            'renderError',
          ],
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always,
        },
      ],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 3,
          multiline: 1,
        },
      ],
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/component-tags-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      'vue/no-unused-components': 'warn', // 警告未使用的组件
      'vue/no-unused-vars': 'warn', // 警告未使用的变量
      'vue/no-mutating-props': 'error', // 禁止直接修改 props
      'vue/no-setup-props-destructure': 'error', // 禁止解构 props

      // ============ TypeScript 相关规则 ============
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // 警告使用 any 类型
      '@typescript-eslint/no-unsafe-assignment': 'warn', // 警告不安全的赋值
      '@typescript-eslint/no-unsafe-call': 'warn', // 警告不安全的调用
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 警告不安全的成员访问
      '@typescript-eslint/no-unsafe-return': 'warn', // 警告不安全的返回
      '@typescript-eslint/explicit-function-return-type': 'off', // 不要求显式返回类型
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 不要求模块边界类型
      '@typescript-eslint/no-non-null-assertion': 'warn', // 警告非空断言
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-empty-interface': 'off', // 允许空接口
      '@typescript-eslint/no-empty-function': 'warn', // 警告空函数
      '@typescript-eslint/ban-ts-comment': 'warn', // 警告 @ts-ignore 等注释
      '@typescript-eslint/prefer-optional-chain': 'error', // 推荐使用可选链
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // 推荐使用空值合并
      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false, // 禁止 I 前缀
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],

      // ============ Import/Export 相关规则 ============
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // 内置模块
            'external', // 外部依赖
            'internal', // 内部模块
            'parent', // 父级目录
            'sibling', // 同级目录
            'index', // 当前目录
          ],
          'newlines-between': 'always', // 分组之间空行
          alphabetize: {
            order: 'asc', // 字母顺序
            caseInsensitive: true, // 不区分大小写
          },
        },
      ],
      'import/newline-after-import': 'error', // import 后空行
      'import/no-duplicates': 'error', // 禁止重复导入
      'import/no-useless-path-segments': 'error', // 禁止无用路径段
      'import/no-unresolved': 'off', // 关闭未解析检查（交给 TypeScript）
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          vue: 'never',
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.js',
            '**/*.test.ts',
            '**/*.spec.js',
            '**/*.spec.ts',
            '**/*.test.jsx',
            '**/*.test.tsx',
            '**/*.spec.jsx',
            '**/*.spec.tsx',
            '**/*.stories.js',
            '**/*.stories.ts',
            '**/*.stories.jsx',
            '**/*.stories.tsx',
            'vite.config.*',
            'eslint.config.*',
            'jest.config.*',
            'cypress.config.*',
          ],
        },
      ],
      'import/prefer-default-export': 'off', // 不要求默认导出

      // ============ Promise 相关规则 ============
      'promise/always-return': 'error', // Promise 必须返回
      'promise/no-return-wrap': 'error', // 禁止返回包装的 Promise
      'promise/param-names': 'error', // Promise 参数命名规范
      'promise/catch-or-return': 'error', // Promise 必须有 catch 或 return
      'promise/no-native': 'off', // 允许原生 Promise
      'promise/no-nesting': 'warn', // 警告嵌套的 Promise
      'promise/no-promise-in-callback': 'warn', // 警告回调中的 Promise
      'promise/no-callback-in-promise': 'warn', // 警告 Promise 中的回调
      'promise/avoid-new': 'off', // 允许 new Promise

      // ============ 基础 ESLint 规则 ============
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // 生产环境禁止 console
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn', // 生产环境禁止 debugger
      'no-alert': 'error', // 禁止 alert
      'no-unused-vars': 'off', // 使用 TypeScript 的规则
      'no-var': 'error', // 禁止 var
      'prefer-const': 'error', // 推荐使用 const
      'prefer-template': 'error', // 推荐使用模板字符串
      'eqeqeq': ['error', 'always'], // 必须使用 === 和 !==
      'no-eq-null': 'error', // 禁止与 null 比较
      'curly': ['error', 'all'], // 必须使用大括号
      'default-case': 'error', // switch 必须有 default
      'default-case-last': 'error', // default 必须在最后
      'dot-notation': 'error', // 推荐点号访问属性
      'no-else-return': 'error', // 禁止不必要的 else return
      'no-lonely-if': 'error', // 禁止孤独的 if
      'no-multi-assign': 'error', // 禁止连续赋值
      'no-nested-ternary': 'error', // 禁止嵌套三元表达式
      'no-unneeded-ternary': 'error', // 禁止不必要的三元表达式
      'one-var': ['error', 'never'], // 禁止多个变量声明
      'operator-assignment': ['error', 'always'], // 推荐运算符简写
      'prefer-exponentiation-operator': 'error', // 推荐使用指数运算符
      'prefer-object-spread': 'error', // 推荐使用对象扩展
      'yoda': 'error', // 禁止 Yoda 表达式
      'array-callback-return': 'error', // 数组回调必须返回
      'consistent-return': 'error', // 函数必须一致返回
      'max-depth': ['error', 4], // 最大嵌套深度
      'max-lines': ['warn', 500], // 最大行数警告
      'max-params': ['error', 5], // 最大参数个数
      'max-statements': ['warn', 20], // 最大语句数警告
      'no-empty': ['error', { allowEmptyCatch: true }], // 禁止空块，但允许空 catch
      'no-eval': 'error', // 禁止 eval
      'no-implied-eval': 'error', // 禁止隐式 eval
      'no-invalid-this': 'error', // 禁止无效的 this
      'no-return-assign': 'error', // 禁止在返回语句中赋值
      'no-script-url': 'error', // 禁止 javascript: URL
      'no-throw-literal': 'error', // 禁止抛出字面量
      'no-useless-call': 'error', // 禁止不必要的 call
      'no-useless-concat': 'error', // 禁止不必要的字符串连接
      'no-useless-escape': 'error', // 禁止不必要的转义
      'no-useless-return': 'error', // 禁止不必要的 return
      'radix': 'error', // parseInt 必须指定基数
      'require-await': 'error', // async 函数必须有 await
      'wrap-iife': ['error', 'inside'], // 立即执行函数必须用括号包裹

      // ============ Unicorn 插件规则 ============
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true, // 文件名使用短横线命名
            pascalCase: true, // 组件文件使用帕斯卡命名
          },
        },
      ],
      'unicorn/no-array-for-each': 'off', // 允许 forEach
      'unicorn/no-null': 'off', // 允许使用 null
      'unicorn/prefer-module': 'off', // 不强制使用 ES 模块
      'unicorn/prefer-node-protocol': 'error', // 推荐使用 node: 协议
      'unicorn/prevent-abbreviations': 'off', // 不禁止缩写
      'unicorn/no-abusive-eslint-disable': 'error', // 禁止滥用 eslint-disable
      'unicorn/no-useless-switch-case': 'error', // 禁止无用的 switch case
      'unicorn/prefer-switch': 'error', // 多个 if-else 推荐使用 switch
      'unicorn/prefer-ternary': 'error', // 简单的 if-else 推荐使用三元表达式
      'unicorn/prefer-set-has': 'error', // 推荐使用 Set.has

      // ============ 代码风格规则 ============
      'arrow-body-style': ['error', 'as-needed'], // 箭头函数体风格
      'arrow-parens': ['error', 'always'], // 箭头函数参数必须括号
      'arrow-spacing': 'error', // 箭头函数空格
      'generator-star-spacing': ['error', { before: false, after: true }], // generator 星号空格
      'no-confusing-arrow': 'error', // 禁止混淆的箭头函数
      'no-duplicate-imports': 'error', // 禁止重复导入
      'no-useless-computed-key': 'error', // 禁止无用的计算属性
      'no-useless-rename': 'error', // 禁止无用的重命名
      'object-shorthand': ['error', 'always'], // 对象属性简写
      'prefer-arrow-callback': 'error', // 推荐箭头函数回调
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ], // 推荐解构赋值
      'rest-spread-spacing': ['error', 'never'], // rest/spread 操作符空格
      'template-curly-spacing': 'error', // 模板字符串空格
    },
  },
];
```

## 新增的规则分类说明：

### 1. **Vue 增强规则**

- 组件属性排序、组件选项排序
- HTML 标签闭合格式规范
- 组件标签顺序（template → script → style）
- 组件使用规范警告

### 2. **TypeScript 增强规则**

- 类型导入一致性检查
- 命名约定规范（禁止 I 前缀接口）
- 现代语法推荐（可选链、空值合并）
- 类型安全相关警告

### 3. **导入/导出规范**

- 自动分组和排序
- 禁止重复导入
- 检查外部依赖
- 导入路径规范

### 4. **Promise 最佳实践**

- 异常处理要求
- 避免常见错误模式
- 代码结构优化

### 5. **代码质量规则**

- 禁止危险操作（eval、with 等）
- 复杂度控制（嵌套深度、函数长度）
- 代码冗余检查
- 现代语法推荐

### 6. **Unicorn 插件规则**

- 文件名规范
- Node.js 最佳实践
- 代码优化建议

### 7. **代码风格规则**

- 箭头函数规范
- 解构赋值推荐
- 对象属性简写
- 模板字符串规范
  1

## 使用建议：

1. **按需调整**：根据项目实际情况调整规则级别（error/warn/off）
2. **渐进采用**：可以先设为 warn，逐步修复问题后改为 error
3. **团队统一**：团队讨论确定规则，保持一致风格
4. **配合工具**：结合 Prettier、EditorConfig 等工具
5. **定期更新**：定期检查是否有新规则或弃用规则

这个配置提供了全面的代码质量检查，可以帮助团队保持代码一致性，减少错误，提高可维护性。
