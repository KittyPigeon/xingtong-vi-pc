# 环境搭建

node 22.5.1

## husky配置

- 初始化 Husky（会创建 .husky/ 基础结构）：
  ```bash
  npx husky init
  ```
- 安装 Husky 依赖：
  ```bash
  npm install husky --save-dev
  ```
- 配置 Husky 钩子（例如 pre-commit）：

  ```bash
  npx husky add .husky/pre-commit "npm run lint"
  ```

正确提交记录： echo "feat(ui): 添加响应式布局组件" | npx commitlint

## 代码规范的制定

- eslint规范
- prettier 规范
- stylelint规范
- commitlint规范
- store代码规范
- vite 代码规范
-

##
