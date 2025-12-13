import { defineStore } from 'pinia';
import { themes, applyTheme, type ThemeKey } from '@/themes';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    primaryColor: '#409eff',
    currentKey: 'blue' as ThemeKey,
    presets: Object.entries(themes).map(([key, t]) => ({
      key,
      name: t.name,
      color: t.vars['--el-color-primary'],
    })),
  }),
  actions: {
    setPrimaryColor(color: string) {
      this.primaryColor = color;
      document.documentElement.style.setProperty('--el-color-primary', color);
      localStorage.setItem('theme-primary-color', color);
    },
    setThemeByKey(key: ThemeKey) {
      const t = themes[key];
      if (!t) return;
      this.currentKey = key;
      this.primaryColor = t.vars['--el-color-primary'];
      applyTheme(t.vars);
      localStorage.setItem('theme-key', key);
    },
    init() {
      const savedKey = localStorage.getItem('theme-key') as ThemeKey | null;
      if (savedKey && themes[savedKey]) {
        this.setThemeByKey(savedKey);
        return;
      }
      const savedColor = localStorage.getItem('theme-primary-color');
      if (savedColor) this.primaryColor = savedColor;
      document.documentElement.style.setProperty('--el-color-primary', this.primaryColor);
    },
  },
});
