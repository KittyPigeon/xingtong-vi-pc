export type Locale = 'zh-CN' | 'en';

export const messages: Record<Locale, Record<string, unknown>> = {
  'zh-CN': {
    common: {
      welcome: '欢迎使用',
      description: '此模板已适配 pad 与 PC 尺寸。',
      modules: { a: '模块 A', b: '模块 B', c: '模块 C' },
    },
  },
  en: {
    common: {
      welcome: 'Welcome',
      description: 'This template adapts to tablet and PC sizes.',
      modules: { a: 'Module A', b: 'Module B', c: 'Module C' },
    },
  },
};
