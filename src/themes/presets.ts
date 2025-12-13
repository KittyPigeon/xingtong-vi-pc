import type { ThemeKey, ThemeVars } from './types';

export const themes: Record<ThemeKey, ThemeVars> = {
  blue: {
    name: '蓝色',
    vars: {
      '--el-color-primary': '#409eff',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  green: {
    name: '绿色',
    vars: {
      '--el-color-primary': '#67c23a',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  orange: {
    name: '橙色',
    vars: {
      '--el-color-primary': '#e6a23c',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  red: {
    name: '红色',
    vars: {
      '--el-color-primary': '#f56c6c',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  gray: {
    name: '灰色',
    vars: {
      '--el-color-primary': '#909399',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  mint: {
    name: '薄荷',
    vars: {
      '--el-color-primary': '#00b96b',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
  purple: {
    name: '紫色',
    vars: {
      '--el-color-primary': '#8a2be2',
      '--app-bg-color': '#ffffff',
      '--app-text-color': '#1f2937',
      '--app-border-color': '#e5e7eb',
    },
  },
};

export function applyTheme(vars: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}
