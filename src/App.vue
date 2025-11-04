<template>
  <ResponsiveLayout>
    <div class="container">
      <h2>欢迎使用</h2>
      <p>此模板已适配 pad 与 PC 尺寸。</p>

      <div class="cards">
        <div class="card">模块 A</div>
        <div class="card">模块 B</div>
        <div class="card">模块 C</div>
      </div>

      <!-- 路由页面渲染区域 -->
      <RouterView />
    </div>
  </ResponsiveLayout>
</template>

<script setup>
  import ResponsiveLayout from './components/ResponsiveLayout.vue';
</script>

<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 12px;
  }

  .card {
    width: 200px;
    padding: 16px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 10px;
  }

  @media (width >=768px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width >=1024px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
