# Vite 配置规范与高效配置指南

## 一、基础配置规范

### 1.1 配置文件结构规范

```typescript
// vite.config.ts - 推荐结构
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import type { PluginOption } from 'vite';
import path from 'path';
import fs from 'fs';

// 插件按需引入
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { viteMockServe } from 'vite-plugin-mock';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';

// 环境变量类型定义
interface ViteEnv {
  VITE_PORT: number;
  VITE_OPEN: boolean;
  VITE_PUBLIC_PATH: string;
  VITE_PROXY_DOMAIN: string;
  VITE_PROXY_DOMAIN_REAL: string;
  VITE_DROP_CONSOLE: boolean;
  VITE_DROP_DEBUGGER: boolean;
  VITE_LEGACY: boolean;
}

// 路径解析
const resolve = (dir: string) => path.resolve(__dirname, dir);

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd()) as unknown as ViteEnv;
  const {
    VITE_PORT,
    VITE_OPEN,
    VITE_PUBLIC_PATH,
    VITE_PROXY_DOMAIN,
    VITE_PROXY_DOMAIN_REAL,
    VITE_DROP_CONSOLE,
    VITE_DROP_DEBUGGER,
    VITE_LEGACY,
  } = env;

  // 生产环境判断
  const isBuild = command === 'build';
  const isReport = mode === 'report';

  return {
    // 基础配置
    base: VITE_PUBLIC_PATH,
    root: process.cwd(),

    // 插件配置
    plugins: createPlugins(isBuild, env),

    // 解析配置
    resolve: resolveConfig(),

    // 服务器配置
    server: serverConfig(VITE_PORT, VITE_OPEN, VITE_PROXY_DOMAIN, VITE_PROXY_DOMAIN_REAL),

    // 构建配置
    build: buildConfig(isBuild, isReport, VITE_DROP_CONSOLE, VITE_DROP_DEBUGGER),

    // 预构建配置
    optimizeDeps: optimizeDepsConfig(),

    // CSS 配置
    css: cssConfig(),

    // ESBuild 配置
    esbuild: esbuildConfig(VITE_DROP_CONSOLE, VITE_DROP_DEBUGGER),

    // 日志级别
    logLevel: 'warn',

    // 开发服务器配置
    preview: {
      port: 4173,
      host: true,
      open: true,
    },
  };
});

// 插件配置工厂函数
function createPlugins(isBuild: boolean, env: ViteEnv): PluginOption[] {
  const plugins: PluginOption[] = [
    vue({
      // Vue 3 特性支持
      reactivityTransform: true,
      template: {
        compilerOptions: {
          // 自定义指令支持
          isCustomElement: (tag) => tag.startsWith('x-'),
        },
      },
    }),

    // JSX 支持
    vueJsx({
      // 启用优化
      optimize: true,
    }),

    // SVG 图标
    createSvgIconsPlugin({
      iconDirs: [resolve('src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: isBuild,
      inject: 'body-last',
    }),

    // HTML 模板配置
    createHtmlPlugin({
      minify: isBuild,
      inject: {
        data: {
          title: env.VITE_APP_TITLE || 'Vite App',
          injectScript: isBuild ? '' : '<script>console.log("开发模式")</script>',
        },
      },
    }),
  ];

  // 开发环境插件
  if (!isBuild) {
    plugins.push(
      viteMockServe({
        mockPath: 'mock',
        enable: true,
        logger: true,
        watchFiles: true,
      })
    );
  }

  // 生产环境插件
  if (isBuild) {
    plugins.push(
      // Gzip 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Brotli 压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      })
    );

    // 打包分析
    if (env.VITE_REPORT === 'true') {
      plugins.push(
        visualizer({
          filename: './dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })
      );
    }
  }

  return plugins;
}

// 解析配置
function resolveConfig() {
  return {
    alias: {
      '@': resolve('src'),
      '@api': resolve('src/api'),
      '@assets': resolve('src/assets'),
      '@components': resolve('src/components'),
      '@hooks': resolve('src/hooks'),
      '@layouts': resolve('src/layouts'),
      '@router': resolve('src/router'),
      '@store': resolve('src/store'),
      '@styles': resolve('src/styles'),
      '@utils': resolve('src/utils'),
      '@views': resolve('src/views'),
      '@types': resolve('src/types'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    dedupe: ['vue', 'vue-router'],
  };
}

// 服务器配置
function serverConfig(port: number, open: boolean, proxyDomain: string, proxyDomainReal: string) {
  return {
    host: true, // 监听所有地址
    port,
    open,
    strictPort: true, // 端口被占用时直接退出
    cors: true,
    hmr: {
      overlay: true, // 编译错误显示在浏览器
    },
    proxy: {
      '/api': {
        target: proxyDomain,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 更多配置
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/socket': {
        target: proxyDomainReal,
        ws: true,
        changeOrigin: true,
      },
    },
    fs: {
      // 限制为工作空间 root 目录访问
      allow: ['..'],
      // 严格模式
      strict: true,
    },
  };
}

// 构建配置
function buildConfig(
  isBuild: boolean,
  isReport: boolean,
  dropConsole: boolean,
  dropDebugger: boolean
) {
  return {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'static',
    assetsInlineLimit: 4096, // 4kb 以下 base64 内联
    sourcemap: isBuild ? false : 'inline',
    minify: isBuild ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: dropConsole,
        drop_debugger: dropDebugger,
        pure_funcs: isBuild ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        main: resolve('index.html'),
      },
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css|scss|sass|less|styl|stylus)$/.test(assetInfo.name)) {
              return `static/css/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico|bmp|tiff?)$/.test(assetInfo.name)) {
              return `static/images/[name]-[hash].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `static/fonts/[name]-[hash].${ext}`;
            }
          }
          return `static/assets/[name]-[hash].[ext]`;
        },
        manualChunks: (id) => {
          // 依赖包拆分
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vendor-vue';
            }
            if (id.includes('element-plus')) {
              return 'vendor-element';
            }
            if (id.includes('lodash') || id.includes('lodash-es')) {
              return 'vendor-lodash';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            if (id.includes('echarts')) {
              return 'vendor-echarts';
            }
            // 其他 node_modules 包
            return 'vendor-other';
          }
          // 业务代码拆分
          if (id.includes('src/views')) {
            const match = id.match(/src\/views\/(.*?)\//);
            if (match && match[1]) {
              return `view-${match[1]}`;
            }
          }
        },
      },
      // 外部依赖（CDN 引入）
      external: [],
      treeshake: {
        preset: 'recommended',
        propertyReadSideEffects: false,
      },
    },
    // 构建输出报告
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
    // 清空输出目录
    emptyOutDir: true,
    // 现代浏览器构建
    polyfillModulePreload: true,
    modulePreload: {
      polyfill: true,
    },
  };
}

// 预构建配置
function optimizeDepsConfig() {
  return {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'dayjs',
      'lodash-es',
      'element-plus',
      'echarts',
    ],
    exclude: [],
    // 强制预构建
    force: false,
    // 缓存配置
    cacheDir: resolve('node_modules/.vite'),
    // 预构建优化
    esbuildOptions: {
      target: 'es2015',
      supported: {
        'top-level-await': true,
      },
    },
  };
}

// CSS 配置
function cssConfig() {
  return {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
          @use "@/styles/functions.scss" as *;
        `,
        charset: false,
      },
      less: {
        javascriptEnabled: true,
        modifyVars: {
          hack: `true; @import "${resolve('src/styles/theme.less')}";`,
        },
      },
    },
    postcss: {
      plugins: [
        require('autoprefixer')({
          overrideBrowserslist: [
            'Android >= 4.0',
            'iOS >= 7',
            'Chrome > 31',
            'ff > 31',
            'ie >= 8',
            'last 2 versions',
          ],
          grid: true,
        }),
        require('postcss-pxtorem')({
          rootValue: 16,
          propList: ['*'],
          exclude: /node_modules/i,
        }),
      ],
    },
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      localsConvention: 'camelCaseOnly',
    },
    devSourcemap: true,
  };
}

// ESBuild 配置
function esbuildConfig(dropConsole: boolean, dropDebugger: boolean) {
  return {
    pure: dropConsole ? ['console.log', 'console.info'] : [],
    drop: dropDebugger ? ['debugger'] : [],
    target: 'es2015',
    supported: {
      'top-level-await': true,
    },
  };
}
```

### 1.2 环境变量配置规范

```bash
# .env - 默认配置
VITE_PORT=3000
VITE_OPEN=true
VITE_PUBLIC_PATH=/
VITE_PROXY_DOMAIN=http://localhost:8080
VITE_PROXY_DOMAIN_REAL=http://localhost:8080
VITE_DROP_CONSOLE=false
VITE_DROP_DEBUGGER=false
VITE_LEGACY=false
VITE_COMPRESSION=true
VITE_REPORT=false
VITE_APP_TITLE=Vite App

# .env.development - 开发环境
VITE_API_BASE_URL=/api
VITE_MOCK=true
VITE_SOURCEMAP=true

# .env.production - 生产环境
VITE_API_BASE_URL=/api
VITE_MOCK=false
VITE_SOURCEMAP=false
VITE_DROP_CONSOLE=true
VITE_DROP_DEBUGGER=true

# .env.staging - 预发环境
VITE_API_BASE_URL=https://staging-api.example.com
VITE_MOCK=false
```

```typescript
// src/env.d.ts - 类型声明
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: string;
  readonly VITE_OPEN: string;
  readonly VITE_PUBLIC_PATH: string;
  readonly VITE_PROXY_DOMAIN: string;
  readonly VITE_PROXY_DOMAIN_REAL: string;
  readonly VITE_DROP_CONSOLE: string;
  readonly VITE_DROP_DEBUGGER: string;
  readonly VITE_LEGACY: string;
  readonly VITE_COMPRESSION: string;
  readonly VITE_REPORT: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MOCK: string;
  readonly VITE_SOURCEMAP: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 二、高效配置优化

### 2.1 构建性能优化

```typescript
// vite.config.ts - 性能优化配置
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // 1. 代码分割优化
    rollupOptions: {
      output: {
        // 优化 chunk 分割
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 按包名分组
            if (id.includes('@vue')) {
              return 'vendor-vue';
            }
            if (id.includes('element-plus')) {
              return 'vendor-element';
            }
            if (id.includes('echarts')) {
              return 'vendor-echarts';
            }
            if (id.includes('lodash')) {
              return 'vendor-lodash';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // 剩余的第三方包
            return 'vendor';
          }

          // 业务代码按路由分割
          if (id.includes('/src/views/')) {
            const match = id.match(/src\/views\/([^\/]+)/);
            if (match) return `view-${match[1]}`;
          }

          // 公共组件单独打包
          if (id.includes('/src/components/')) {
            const match = id.match(/src\/components\/([^\/]+)/);
            if (match) return `component-${match[1]}`;
          }
        },

        // 2. 长缓存优化
        entryFileNames: 'static/js/[name]-[hash:8].js',
        chunkFileNames: 'static/js/[name]-[hash:8].js',
        assetFileNames: 'static/[ext]/[name]-[hash:8].[ext]',
      },
    },

    // 3. 压缩优化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console 和 debugger
        drop_console: true,
        drop_debugger: true,
        // 内联只调用一次的变量
        collapse_vars: true,
        // 移除无用代码
        dead_code: true,
        // 简化表达式
        evaluate: true,
        // 函数内联
        inline: 3,
        // 合并变量
        join_vars: true,
        // 减少变量
        reduce_vars: true,
        // 移除未使用的函数参数
        unused: true,
      },
      mangle: {
        safari10: true,
      },
    },

    // 4. 构建报告
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
  },

  plugins: [
    // 5. 图片压缩
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),

    // 6. PWA 支持
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Vite App',
        short_name: 'ViteApp',
        description: 'A Vite-based application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),

    // 7. 打包分析
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst' | 'network' | 'treemap'
    }),
  ],
});
```

### 2.2 开发体验优化

```typescript
// vite.config.ts - 开发体验优化
import { defineConfig } from 'vite';
import { VitePluginFonts } from 'vite-plugin-fonts';
import Inspect from 'vite-plugin-inspect';
import vitePluginImp from 'vite-plugin-imp';

export default defineConfig({
  server: {
    // 1. 热更新优化
    hmr: {
      overlay: false, // 不显示错误覆盖层，提升性能
    },

    // 2. 中间件优化
    middlewareMode: false,

    // 3. 预请求优化
    preTransformRequests: true,

    // 4. 开发服务器缓存
    cacheDir: '.vite',

    // 5. 优化代理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 缓存代理响应
        agent: new (require('http').Agent)({ keepAlive: true }),
        // 优化重写
        rewrite: (path) => path.replace(/^\/api/, '/v1/api'),
        // 超时设置
        timeout: 5000,
        // 重试
        retries: 3,
      },
    },
  },

  plugins: [
    // 6. 字体优化
    VitePluginFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@300;400;500;700',
          },
          {
            name: 'Open Sans',
            styles: 'ital,wght@0,300..800;1,300..800',
          },
        ],
        display: 'swap',
        preconnect: true,
      },
      custom: {
        families: [
          {
            name: 'MyFont',
            src: './src/assets/fonts/*.ttf',
          },
        ],
        display: 'auto',
      },
    }),

    // 7. 按需导入优化（如 Element Plus）
    vitePluginImp({
      libList: [
        {
          libName: 'element-plus',
          style: (name) => {
            return `element-plus/es/components/${name}/style/css`;
          },
        },
      ],
    }),

    // 8. 调试插件
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
  ],

  // 9. 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'lodash-es',
      'dayjs',
      'axios',
      'echarts/core',
      'echarts/charts',
      'echarts/components',
      'echarts/renderers',
    ],
    exclude: ['vue-demi'],

    // 强制预构建特定包
    entries: ['src/main.ts', 'src/views/**/*.vue'],

    // 优化 esbuild 配置
    esbuildOptions: {
      plugins: [
        {
          name: 'import-analysis',
          setup(build) {
            build.onResolve({ filter: /^vue$/ }, () => {
              return { path: require.resolve('vue/dist/vue.esm-bundler.js') };
            });
          },
        },
      ],
    },
  },

  // 10. CSS 开发优化
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[local]_[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // 使用现代编译器
      },
    },
  },
});
```

### 2.3 多环境配置管理

```typescript
// config/vite/ - 多环境配置目录
// config/vite/base.config.ts - 基础配置
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export const baseConfig = defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

// config/vite/dev.config.ts - 开发环境配置
import { mergeConfig } from 'vite';
import { baseConfig } from './base.config';

export const devConfig = mergeConfig(baseConfig, {
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
    sourcemap: true,
  },
});

// config/vite/prod.config.ts - 生产环境配置
import { mergeConfig } from 'vite';
import { baseConfig } from './base.config';
import viteCompression from 'vite-plugin-compression';

export const prodConfig = mergeConfig(baseConfig, {
  plugins: [viteCompression()],
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['lodash-es', 'dayjs', 'axios'],
        },
      },
    },
  },
});

// vite.config.ts - 主配置文件
import { defineConfig, loadEnv } from 'vite';
import { devConfig } from './config/vite/dev.config';
import { prodConfig } from './config/vite/prod.config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // 根据环境返回配置
  if (mode === 'development') {
    return devConfig;
  }

  if (mode === 'production') {
    return prodConfig;
  }

  // 自定义环境
  if (mode === 'staging') {
    return mergeConfig(prodConfig, {
      define: {
        'process.env.NODE_ENV': JSON.stringify('staging'),
      },
    });
  }

  return devConfig;
});
```

## 三、高级优化配置

### 3.1 微前端支持配置

```typescript
// vite.config.ts - 微前端配置
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'host-app',
      remotes: {
        remote_app: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],

  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'esm',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
```

### 3.2 CDN 优化配置

```typescript
// vite.config.ts - CDN 优化
import { defineConfig } from 'vite';
import externalGlobals from 'rollup-plugin-external-globals';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'element-plus', 'axios', 'echarts'],
      plugins: [
        externalGlobals({
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'element-plus': 'ElementPlus',
          axios: 'axios',
          echarts: 'echarts',
        }),
      ],
    },
  },
});
```

### 3.3 自定义插件示例

```typescript
// plugins/my-plugin.ts - 自定义插件
import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

export interface MyPluginOptions {
  /**
   * 扫描的目录
   */
  scanDir?: string;
  /**
   * 输出文件
   */
  outputFile?: string;
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  const { scanDir = 'src/apis', outputFile = 'src/auto-import-apis.ts' } = options;

  let config: any;

  return {
    name: 'vite-plugin-auto-import-apis',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      const apisDir = path.resolve(config.root, scanDir);

      if (!fs.existsSync(apisDir)) {
        return;
      }

      const files = fs.readdirSync(apisDir);
      const apiImports: string[] = [];
      const apiExports: string[] = [];

      files.forEach((file) => {
        if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
          const name = path.basename(file, '.ts');
          const importPath = `./${scanDir}/${name}`;

          apiImports.push(`import ${name} from '${importPath}'`);
          apiExports.push(`export { ${name} }`);
        }
      });

      const content = `
// Auto-generated by vite-plugin-auto-import-apis
// DO NOT EDIT!

${apiImports.join('\n')}

${apiExports.join('\n')}

export default {
  ${files.map((file) => path.basename(file, '.ts')).join(',\n  ')}
}
`;

      const outputPath = path.resolve(config.root, outputFile);
      fs.writeFileSync(outputPath, content);

      console.log(`✨ Auto-generated API imports at ${outputFile}`);
    },

    handleHotUpdate({ file, server }) {
      if (file.includes(scanDir) && file.endsWith('.ts')) {
        server.restart();
      }
    },
  };
}

// 使用自定义插件
import myPlugin from './plugins/my-plugin';

export default defineConfig({
  plugins: [
    myPlugin({
      scanDir: 'src/services',
      outputFile: 'src/services/index.ts',
    }),
  ],
});
```

### 3.4 性能监控配置

```typescript
// vite.config.ts - 性能监控
import { defineConfig } from 'vite';
import { vitePluginPerf } from 'vite-plugin-perf';

export default defineConfig({
  plugins: [
    vitePluginPerf({
      // 性能监控选项
      dev: true,
      build: true,
      analyzer: {
        enabled: true,
        output: 'dist/performance.json',
      },
      // 自定义指标
      customMetrics: {
        loadTime: true,
        firstPaint: true,
        firstContentfulPaint: true,
        largestContentfulPaint: true,
      },
    }),
  ],

  // 构建性能优化
  build: {
    // 并发构建
    chunkSizeWarningLimit: 1000,
    // 优化输出
    reportCompressedSize: true,
    // 输出性能报告
    rollupOptions: {
      perf: true,
    },
  },

  // 开发服务器性能
  server: {
    // 启用中间件缓存
    middlewareCache: true,
    // 优化文件监听
    watch: {
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
    },
  },
});
```

## 四、最佳实践规范

### 4.1 配置文件组织规范

```
project/
├── vite.config.ts              # 主配置文件
├── config/
│   ├── vite/
│   │   ├── base.config.ts     # 基础配置
│   │   ├── dev.config.ts      # 开发环境配置
│   │   ├── prod.config.ts     # 生产环境配置
│   │   └── test.config.ts     # 测试环境配置
│   └── env/
│       ├── .env.development
│       ├── .env.production
│       └── .env.staging
├── plugins/                    # 自定义插件
│   ├── auto-import.ts
│   ├── svg-loader.ts
│   └── compression.ts
└── scripts/                   # 构建脚本
    ├── build.js
    ├── preview.js
    └── analyze.js
```

### 4.2 构建脚本优化

```json
// package.json - 优化脚本
{
  "scripts": {
    "dev": "vite",
    "dev:https": "vite --https",
    "dev:host": "vite --host",
    "build": "vue-tsc && vite build",
    "build:prod": "vue-tsc && vite build --mode production",
    "build:staging": "vue-tsc && vite build --mode staging",
    "build:analyze": "vue-tsc && vite build --mode report",
    "preview": "vite preview",
    "preview:prod": "vite preview --mode production",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "type-check": "vue-tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "deploy": "npm run build && ./scripts/deploy.sh",
    "clean": "rimraf dist node_modules/.vite node_modules/.cache",
    "reset": "npm run clean && npm install"
  }
}
```

### 4.3 缓存策略配置

```typescript
// vite.config.ts - 缓存优化
import { defineConfig } from 'vite';

export default defineConfig({
  cacheDir: '.vite',

  optimizeDeps: {
    // 缓存依赖预构建
    cacheDir: '.vite/deps',
    // 强制刷新缓存
    force: process.env.CLEAN_CACHE ? true : undefined,
  },

  build: {
    // 输出文件添加 hash
    rollupOptions: {
      output: {
        entryFileNames: `[name]-[hash].js`,
        chunkFileNames: `[name]-[hash].js`,
        assetFileNames: `[name]-[hash].[ext]`,
      },
    },
  },

  // 开发服务器缓存
  server: {
    // 启用文件系统缓存
    fs: {
      cachedChecks: true,
    },
    // 预转换请求
    preTransformRequests: true,
  },
});
```

### 4.4 安全配置

```typescript
// vite.config.ts - 安全配置
import { defineConfig } from 'vite';

export default defineConfig({
  // 禁用 sourcemap 泄露
  build: {
    sourcemap: false,
  },

  // 安全头
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://api.example.com;
      `.replace(/\s+/g, ' '),
    },
  },

  // 环境变量保护
  envPrefix: ['VITE_', 'PUBLIC_'],

  // 禁用敏感信息
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
});
```

## 五、常见问题与解决方案

### 5.1 内存溢出问题

```typescript
// 解决方案：增加内存限制
// package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' vite",
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}

// 或在 vite.config.ts 中优化
export default defineConfig({
  build: {
    // 减少并行任务
    chunkSizeWarningLimit: 500,
    // 关闭大文件警告
    reportCompressedSize: false
  },

  optimizeDeps: {
    // 减少预构建包
    include: ['vue', 'vue-router', 'pinia'],
    // 排除大包
    exclude: ['@babel/runtime']
  }
})
```

### 5.2 构建速度优化

```typescript
// vite.config.ts - 构建速度优化
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // 1. 关闭不必要的功能
    minify: 'terser',
    cssCodeSplit: true,

    // 2. 优化 Rollup 配置
    rollupOptions: {
      // 并行构建
      maxParallelFileOps: 4,
      // 优化树摇
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
      // 优化输出
      output: {
        compact: true,
        exports: 'auto',
      },
    },

    // 3. 目标环境
    target: 'es2015',

    // 4. 关闭 sourcemap（生产环境）
    sourcemap: false,
  },

  // 5. 优化依赖
  optimizeDeps: {
    // 预构建关键依赖
    include: ['vue', 'vue-router', 'pinia', 'lodash-es', 'dayjs'],
    // 排除不必要的依赖
    exclude: [],
    // 不强制刷新
    force: false,
  },

  // 6. 并行处理
  worker: {
    format: 'es',
    plugins: [],
  },
});
```

### 5.3 兼容性配置

```typescript
// vite.config.ts - 浏览器兼容性
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: [
        'defaults',
        'not IE 11',
        'chrome >= 60',
        'firefox >= 60',
        'safari >= 12',
        'edge >= 15',
        'ios >= 12',
        'android >= 6',
      ],
      modernPolyfills: ['es.array.at', 'es.array.find-last', 'es.string.match-all'],
      renderLegacyChunks: false,
    }),
  ],

  build: {
    // 现代构建
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],

    // 传统构建
    polyfillDynamicImport: false,
  },
});
```

## 六、总结

通过以上配置规范和优化策略，可以构建出高性能、可维护的 Vite 项目。关键点包括：

1. **配置文件结构化**：分离基础、开发、生产配置
2. **构建性能优化**：代码分割、缓存策略、压缩优化
3. **开发体验优化**：热更新、代理、按需导入
4. **安全配置**：环境变量保护、安全头设置
5. **兼容性处理**：传统浏览器支持

根据项目实际需求选择合适的配置组合，定期更新依赖和优化配置，以保持最佳性能。
