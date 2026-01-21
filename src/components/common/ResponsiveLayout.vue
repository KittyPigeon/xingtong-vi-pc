<template>
  <div class="layout">
    <div class="header"></div>
    <main class="content">
      <slot />
    </main>
    <footer class="footer"></footer>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useAppStore } from '@/store';

  const appStore = useAppStore();
  const sidebarOpen = computed(() => appStore.sidebarOpen);

  const toggleSidebar = () => appStore.toggleSidebar();
</script>

<style scoped lang="scss">
  .layout {
    display: grid;
    grid-template: 'header' var(--header-height) 'content' 1fr / 1fr;
    min-height: 100vh;
  }

  /* Header */
  .header {
    display: flex;
    grid-area: header;
    gap: 12px;
    align-items: center;
    height: var(--header-height);
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #eee;
  }

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .menu-btn {
    font-size: 20px;
    cursor: pointer;
    background: transparent;
    border: none;
  }

  /* Sidebar base (hidden on tablet by default) */
  .sidebar {
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    z-index: 20;
    width: var(--sidebar-width);
    background: #fff;
    border-right: 1px solid #eee;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .nav {
    display: flex;
    flex-direction: column;
    padding: 12px;
  }

  .nav-item {
    padding: 10px 12px;
    margin-bottom: 4px;
    color: #333;
    text-decoration: none;
    border-radius: 8px;

    &:hover {
      background: #f1f1f3;
    }
  }

  /* Overlay when sidebar open on tablet */
  .overlay {
    position: fixed;
    inset: var(--header-height) 0 0 0;
    z-index: 10;
    background: rgb(0 0 0 / 24%);
  }

  /* Content */
  .content {
    grid-area: content;
    padding: 16px;
  }

  /* Desktop layout: persistent sidebar */
  @media (width >= 1024px) {
    .layout {
      grid-template:
        'header header' var(--header-height) 'sidebar content' 1fr / var(--sidebar-width)
        1fr;
    }

    .header {
      grid-column: 1 / span 2;
      padding: 0 20px;
    }

    .sidebar {
      position: static;
      grid-area: sidebar;
      height: calc(100vh - var(--header-height));
      transform: none !important;
    }

    .overlay {
      display: none;
    }

    .content {
      padding: 24px;
      background: #f7f7f8;
    }
  }
</style>
