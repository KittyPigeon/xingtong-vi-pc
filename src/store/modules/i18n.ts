import { defineStore } from 'pinia';
import { messages, type Locale } from '@/locales';

function resolve(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (typeof cur === 'string') return cur;
  return path;
}

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: (navigator.language === 'zh-CN' ? 'zh-CN' : 'en') as Locale,
  }),
  getters: {
    t(state) {
      return (key: string) => resolve(messages[state.locale], key);
    },
  },
  actions: {
    setLocale(locale: Locale) {
      this.locale = locale;
      document.documentElement.setAttribute('lang', locale === 'zh-CN' ? 'zh-CN' : 'en');
    },
  },
});
