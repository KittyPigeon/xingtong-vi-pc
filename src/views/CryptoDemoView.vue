<template>
  <div class="crypto-demo-view">
    <el-page-header title="返回" content="API加解密功能演示" @back="$router.back()" />

    <div class="content">
      <CryptoDemo />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElPageHeader } from 'element-plus';
  import CryptoDemo from '@/components/business/CryptoDemo.vue';
</script>

<style scoped lang="scss">
  .crypto-demo-view {
    padding: 20px;

    .content {
      margin-top: 20px;
    }
  }
</style>
