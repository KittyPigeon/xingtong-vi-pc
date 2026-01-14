/// <reference types="vite/client" />

// 添加 Vue 组件的类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENV: string;
  readonly VITE_ENABLE_ENCRYPTION: string;
  readonly VITE_CRYPTO_ALGORITHM: 'AES' | 'DES' | 'Rabbit' | 'RC4';
  readonly VITE_CRYPTO_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
