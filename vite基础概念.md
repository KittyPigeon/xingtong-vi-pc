# Vite 从入门到源码解析

## 一、快速入门

### 1.1 什么是 Vite

Vite（法语意为"快速"）是一种新型的前端构建工具，由 Vue 作者尤雨溪开发。它主要由两部分组成：

- 一个开发服务器，基于原生 ES 模块，提供丰富的内建功能
- 一套构建指令，使用 Rollup 打包代码，并预配置了优化的构建流程

### 1.2 核心优势

- **极速冷启动**：无需打包，直接启动
- **快速热更新**：基于 ES 模块的热更新
- **按需编译**：只编译当前页面依赖的模块

### 1.3 快速开始

```bash
# 创建项目
npm create vite@latest
# 或
yarn create vite
# 或
pnpm create vite

# 选择模板（Vue, React, Preact, Lit, Svelte, Solid 等）
```

### 1.4 项目结构

```
my-vite-app/
├── index.html          # 入口文件
├── package.json
├── vite.config.js     # 配置文件
├── src/
│   ├── main.js        # 主入口
│   └── App.vue        # 根组件
└── public/            # 静态资源
```

### 1.5 基本配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

## 二、深入学习

### 2.1 核心概念

#### 2.1.1 原生 ES 模块

Vite 利用浏览器原生支持 ES 模块的特性，在开发阶段不打包，直接按需加载。

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>
```

#### 2.1.2 依赖预构建

- 将 CommonJS/UMD 依赖转换为 ES 模块
- 提高后续页面的加载速度
- 预构建缓存：`node_modules/.vite`

### 2.2 插件系统

#### 2.2.1 内置插件

```javascript
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
  plugins: [
    reactRefresh(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
});
```

#### 2.2.2 自定义插件

```javascript
// my-plugin.js
export default function myPlugin() {
  return {
    name: 'my-plugin',

    // 配置钩子
    config(config) {
      console.log('处理配置');
      return {};
    },

    // 转换钩子
    transform(code, id) {
      if (id.endsWith('.custom')) {
        // 转换代码
        return code.replace('foo', 'bar');
      }
    },

    // 热更新钩子
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'special-update',
          data: {},
        });
      }
    },
  };
}
```

### 2.3 高级配置

#### 2.3.1 环境变量

```javascript
// .env.development
VITE_API_URL=http://localhost:3000

// 使用环境变量
console.log(import.meta.env.VITE_API_URL)
```

#### 2.3.2 CSS 处理

```javascript
// vite.config.js
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`,
      },
    },
  },
});
```

#### 2.3.3 路径别名

```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
    },
  },
});
```

### 2.4 性能优化

#### 2.4.1 代码分割

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lodash')) {
              return 'lodash';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
```

#### 2.4.2 依赖优化

```javascript
export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es', 'axios'],
    exclude: ['vue-demi'],
  },
});
```

## 三、源码解析

### 3.1 架构概览

```
Vite 源码结构
├── packages/
│   ├── vite/                    # 核心包
│   │   ├── src/
│   │   │   ├── node/           # 服务端代码
│   │   │   │   ├── server/     # 开发服务器
│   │   │   │   ├── build/      # 构建逻辑
│   │   │   │   ├── config/     # 配置解析
│   │   │   │   └── plugins/    # 内置插件
│   │   │   └── client/         # 客户端代码
│   │   └── dist/               # 打包输出
│   ├── create-vite/            # 项目脚手架
│   └── plugin-*                # 官方插件
```

### 3.2 核心模块解析

#### 3.2.1 开发服务器（server/index.ts）

```typescript
// 核心启动流程
async function createServer(inlineConfig: InlineConfig = {}): Promise<ViteDevServer> {
  // 1. 解析配置
  const config = await resolveConfig(inlineConfig, 'serve');

  // 2. 创建中间件
  const middlewares = connect();

  // 3. 创建 WebSocket 服务器用于 HMR
  const ws = createWebSocketServer(httpServer);

  // 4. 设置文件监听
  const watcher = chokidar.watch();

  // 5. 创建模块图
  const moduleGraph = new ModuleGraph();

  // 6. 启动服务器
  return {
    config,
    middlewares,
    ws,
    watcher,
    moduleGraph,
    listen,
  };
}
```

#### 3.2.2 模块解析器（server/moduleGraph.ts）

```typescript
class ModuleGraph {
  // 模块图结构
  private urlToModuleMap = new Map<string, ModuleNode>();
  private idToModuleMap = new Map<string, ModuleNode>();

  // 解析模块依赖
  async ensureEntryFromUrl(url: string): Promise<ModuleNode> {
    // 1. 检查缓存
    // 2. 解析模块 ID
    // 3. 创建模块节点
    // 4. 解析导入依赖
  }
}
```

#### 3.2.3 插件容器（node/pluginContainer.ts）

```typescript
// 插件钩子执行器
class PluginContainer {
  async resolveId(id: string, importer?: string): Promise<string | null> {
    // 依次执行插件的 resolveId 钩子
  }

  async load(id: string): Promise<string | null> {
    // 执行插件的 load 钩子
  }

  async transform(code: string, id: string): Promise<{ code: string; map?: any }> {
    // 执行插件的 transform 钩子
  }
}
```

### 3.3 关键流程分析

#### 3.3.1 请求处理流程

```typescript
// 请求处理中间件
function transformMiddleware(server: ViteDevServer): Connect.NextHandleFunction {
  return async function viteTransformMiddleware(req, res, next) {
    // 1. 检查是否是 JS/TS/CSS 等可转换的文件
    // 2. 读取原始文件
    // 3. 调用插件链进行转换
    // 4. 返回转换后的内容
  };
}
```

#### 3.3.2 热更新机制

```typescript
// HMR 核心逻辑
function handleHMRUpdate(file: string, server: ViteDevServer): void {
  // 1. 找到受影响的模块
  const mods = moduleGraph.getModulesByFile(file);

  // 2. 标记更新边界
  const updates: Update[] = [];

  // 3. 发送 WebSocket 消息
  ws.send({
    type: 'update',
    updates,
  });
}
```

### 3.4 客户端 HMR（client/client.ts）

```typescript
// 客户端 HMR 处理
const socket = new WebSocket(`ws://${location.host}`);

socket.addEventListener('message', async ({ data }) => {
  const payload = JSON.parse(data);

  switch (payload.type) {
    case 'connected':
      console.log(`[vite] connected.`);
      break;

    case 'update':
      // 处理模块更新
      payload.updates.forEach((update) => {
        if (update.type === 'js-update') {
          fetchUpdate(update);
        }
      });
      break;
  }
});

async function fetchUpdate(update) {
  // 获取新模块
  const mod = await import(`${update.path}?t=${update.timestamp}`);

  // 执行 accept 回调
  if (mod && mod.hot.accept) {
    mod.hot.accept();
  }
}
```

### 3.5 构建流程（node/build.ts）

```typescript
async function build(inlineConfig: InlineConfig = {}): Promise<void> {
  // 1. 解析配置
  const config = await resolveConfig(inlineConfig, 'build');

  // 2. 清理输出目录
  await fs.remove(config.build.outDir);

  // 3. 写入静态文件
  await copyPublicDir();

  // 4. 运行 Rollup 构建
  const bundle = await rollup.rollup({
    input: config.build.rollupOptions?.input,
    plugins: createBuildPlugins(config),
  });

  // 5. 输出文件
  await bundle.write({
    dir: config.build.outDir,
    format: 'es',
    sourcemap: config.build.sourcemap,
  });
}
```

### 3.6 依赖预构建（node/optimizer/index.ts）

```typescript
async function optimizeDeps(config: ResolvedConfig): Promise<DepOptimizationMetadata> {
  // 1. 计算依赖哈希
  const hash = getDepHash(config);

  // 2. 检查缓存
  if (fs.existsSync(cachePath)) {
    return readCache();
  }

  // 3. 扫描依赖
  const deps = await scanImports(config);

  // 4. 使用 esbuild 打包
  const result = await esbuild.build({
    entryPoints: Object.keys(deps),
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir: cacheDir,
  });

  // 5. 写入缓存
  await writeCache();
}
```

## 四、实战技巧

### 4.1 自定义中间件

```javascript
// vite.config.js
export default defineConfig({
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // 自定义请求处理
      if (req.url === '/custom') {
        res.end('Custom Response');
      } else {
        next();
      }
    });
  },
});
```

### 4.2 自定义转换器

```javascript
export default defineConfig({
  plugins: [
    {
      name: 'custom-transformer',
      transform(src, id) {
        if (id.endsWith('.custom')) {
          // 自定义转换逻辑
          return {
            code: compileCustom(src),
            map: null,
          };
        }
      },
    },
  ],
});
```

### 4.3 调试技巧

```bash
# 1. 查看依赖预构建
DEBUG=vite:* npm run dev

# 2. 分析构建产物
npx vite-bundle-visualizer

# 3. 性能分析
NODE_ENV=production npm run build -- --profile
```

## 五、常见问题

### 5.1 性能问题

- **冷启动慢**：检查 `optimizeDeps.include` 配置
- **热更新慢**：减少大文件或复杂依赖

### 5.2 兼容性问题

```javascript
// 支持传统浏览器
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
});
```

### 5.3 路径问题

```javascript
// 解决第三方库路径问题
export default defineConfig({
  resolve: {
    dedupe: ['vue', 'react'], // 避免重复打包
  },
});
```

## 总结

Vite 通过创新的架构设计，解决了传统构建工具在开发阶段的性能瓶颈。其核心思想是：

1. **开发阶段**：利用浏览器原生 ES 模块，实现按需编译
2. **生产阶段**：使用 Rollup 进行高效打包
3. **插件系统**：提供灵活的扩展机制

通过学习 Vite 的源码，可以深入理解现代前端构建工具的设计理念，为解决实际问题和开发自定义工具打下坚实基础。

**推荐学习路径**：

1. 从官方文档和示例项目开始实践
2. 逐步深入配置和插件开发
3. 阅读源码，理解核心机制
4. 参与社区贡献或开发自定义插件
