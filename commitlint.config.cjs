module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 必须使用约定式提交的类型，且小写
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build'],
    ],
    'type-case': [2, 'always', 'lower-case'],

    // scope 可选，如果有则限定为小写，长度不超过 20
    'scope-empty': [0, 'always'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-max-length': [2, 'always', 20],

    // subject 不要首字母大写，不要句式/驼峰/常量式；长度 5–72
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-min-length': [2, 'always', 5],
    'subject-max-length': [2, 'always', 72],

    // 整体 header（type(scope): subject）最长 72
    'header-max-length': [2, 'always', 72],
  },
  // 中文提示信息
  prompt: {
    messages: {
      type: '选择你要提交的类型:',
      scope: '选择一个 scope (可选):',
      customScope: '请输入自定义的 scope:',
      subject: '填写简短精炼的变更描述:',
      body: '填写更加详细的变更描述 (可选)。使用 "|" 换行:',
      breaking: '列举非兼容性重大的变更 (可选):',
      footer: '列举出所有变更的 ISSUES CLOSED (可选)。 例如: #31, #34:',
      confirmCommit: '确认提交?',
    },
    types: [
      { value: 'feat', name: 'feat:     新增功能' },
      { value: 'fix', name: 'fix:      修复缺陷' },
      { value: 'docs', name: 'docs:     文档变更' },
      { value: 'style', name: 'style:    代码格式（不影响功能，例如空格、分号等格式修正）' },
      { value: 'refactor', name: 'refactor: 代码重构（不包括 bug 修复、功能新增）' },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     添加疏漏测试或已有测试改动' },
      {
        value: 'build',
        name: 'build:    构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）',
      },
      { value: 'ci', name: 'ci:       修改 CI 配置、脚本' },
      {
        value: 'chore',
        name: 'chore:    对构建过程或辅助工具和库的更改（不影响源文件、测试用例）',
      },
    ],
    useEmoji: false,
    emojiAlign: 'center',
    allowCustomScopes: true,
    allowEmptyScopes: false,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
};
