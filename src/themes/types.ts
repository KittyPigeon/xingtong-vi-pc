export type ThemeKey = 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'mint' | 'purple';

export interface ThemeVars {
  name: string;
  vars: Record<string, string>;
}
