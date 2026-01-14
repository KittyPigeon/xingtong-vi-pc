<template>
  <ResponsiveLayout>
    <div class="app-container">
      <div class="toolbar">
        <el-select v-model="lang" size="small" style="width: 140px" @change="onLangChange">
          <el-option label="中文（简体）" value="zh-CN" />
          <el-option label="English" value="en" />
        </el-select>
        <div class="divider"></div>
        <el-select v-model="themeKey" size="small" style="width: 160px" @change="onThemeChange">
          <el-option
            v-for="item in theme.presets"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          >
            <span class="option">
              <span class="swatch" :style="{ background: item.color }"></span>
              <span>{{ item.name }}</span>
            </span>
          </el-option>
        </el-select>
      </div>

      <h2>{{ i18n.t('common.welcome') }}</h2>
      <p>{{ i18n.t('common.description') }}</p>

      <div class="cards">
        <div class="card">{{ i18n.t('common.modules.a') }}</div>
        <div class="card">{{ i18n.t('common.modules.b') }}</div>
        <div class="card">{{ i18n.t('common.modules.c') }}</div>
      </div>
      <div class="rect" :style="`background: ${theme.primaryColor}`"></div>
      <!-- 路由页面渲染区域 -->
      <RouterView />
    </div>
  </ResponsiveLayout>
</template>

<script setup lang="ts">
  import ResponsiveLayout from '@/components/common/ResponsiveLayout.vue';
  import { ref } from 'vue';
  import { useI18nStore, useThemeStore } from '@/store';
  import type { Locale } from '@/locales';
  // import { ElSelect, ElOption } from 'element-plus';

  const i18n = useI18nStore();
  const theme = useThemeStore();
  const lang = ref<Locale>(i18n.locale as Locale);
  function onLangChange(val: Locale) {
    i18n.setLocale(val);
  }
  const themeKey = ref<string>(theme.currentKey);
  function onThemeChange(val: string) {
    theme.setThemeByKey(val as any);
  }
</script>

<style scoped lang="scss">
  .app-container {
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 12px;

      .divider {
        width: 12px;
      }

      .option {
        display: inline-flex;
        gap: 8px;
        align-items: center;
      }

      .swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 50%;
      }
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 12px;
      width: 200px;
      height: 200px;
    }

    .card {
      width: 200px;
      padding: 16px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 10px;
    }

    @media (width >= 768px) {
      .cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (width >= 1024px) {
      .cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }

  .rect {
    height: 300px;
  }
</style>
