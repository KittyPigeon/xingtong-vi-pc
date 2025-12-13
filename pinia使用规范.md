# Pinia 使用教程和最佳实践

## 一、Pinia 简介

### 1.1 什么是 Pinia

Pinia（发音 `/piːnjʌ/`）是 Vue 的官方状态管理库，由 Vue.js 核心团队成员开发。它是 Vuex 的下一代替代品，具有以下特点：

- **完整的 TypeScript 支持**
- **更简洁的 API**（不再有 mutations）
- **模块化设计**（不需要嵌套模块）
- **支持 Composition API 和 Options API**
- **服务器端渲染支持**
- **DevTools 集成**

### 1.2 安装和配置

```bash
# 安装
npm install pinia
# 或
yarn add pinia
# 或
pnpm add pinia
```

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
```

## 二、核心概念和基本使用

### 2.1 定义 Store

#### 2.1.1 基本 Store 定义

```typescript
// stores/counter.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0);

  // Getters
  const doubleCount = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);

  // Actions
  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function incrementBy(amount: number) {
    count.value += amount;
  }

  function reset() {
    count.value = 0;
  }

  // Async action
  async function fetchData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      // 处理数据
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }

  return {
    count,
    doubleCount,
    isEven,
    increment,
    decrement,
    incrementBy,
    reset,
    fetchData,
  };
});
```

#### 2.1.2 Options API 风格

```typescript
// stores/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    age: 0,
    isAuthenticated: false,
    preferences: {
      theme: 'light',
      language: 'zh-CN',
    },
  }),

  getters: {
    // 基本 getter
    displayName: (state) => {
      return state.name || '匿名用户';
    },

    // 带参数的 getter
    greeting: (state) => {
      return (timeOfDay: string) => {
        return `${timeOfDay}好，${state.name || '用户'}！`;
      };
    },

    // 使用其他 getter
    fullInfo: (state) => {
      const store = useUserStore();
      return `${store.displayName} - ${state.email}`;
    },
  },

  actions: {
    // 同步 action
    setUserInfo(
      userInfo: Partial<{
        name: string;
        email: string;
        age: number;
      }>
    ) {
      this.name = userInfo.name || this.name;
      this.email = userInfo.email || this.email;
      this.age = userInfo.age || this.age;
    },

    // 异步 action
    async login(credentials: { username: string; password: string }) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });

        if (response.ok) {
          const userData = await response.json();
          this.setUserInfo(userData);
          this.isAuthenticated = true;
          return { success: true };
        } else {
          throw new Error('登录失败');
        }
      } catch (error) {
        console.error('登录错误:', error);
        return { success: false, error: error.message };
      }
    },

    logout() {
      this.$reset();
    },
  },
});
```

### 2.2 在组件中使用 Store

#### 2.2.1 Composition API 中使用

```vue
<!-- Counter.vue -->
<script setup lang="ts">
  import { useCounterStore } from '@/stores/counter';
  import { storeToRefs } from 'pinia';

  const counterStore = useCounterStore();

  // 使用 storeToRefs 保持响应式
  const { count, doubleCount, isEven } = storeToRefs(counterStore);

  // 直接解构会失去响应性（不要这样做！）
  // const { count } = counterStore ❌

  function handleIncrement() {
    counterStore.increment();
  }

  // 批量修改状态
  function updateMultiple() {
    // 方式1：直接修改
    counterStore.count = 10;

    // 方式2：使用 $patch（推荐批量修改）
    counterStore.$patch({
      count: counterStore.count + 5,
    });

    // 方式3：使用 $patch 函数
    counterStore.$patch((state) => {
      state.count = Math.max(state.count, 0);
    });
  }

  // 订阅状态变化
  counterStore.$subscribe((mutation, state) => {
    console.log('状态变化:', mutation);
    console.log('新状态:', state);

    // 自动保存到 localStorage
    localStorage.setItem('counter', JSON.stringify(state));
  });

  // 订阅 action
  counterStore.$onAction(
    ({
      name, // action 名称
      store, // store 实例
      args, // 传入的参数
      after, // action 完成后的钩子
      onError, // action 出错的钩子
    }) => {
      console.log(`开始执行 ${name}，参数：`, args);

      after((result) => {
        console.log(`${name} 执行成功，结果：`, result);
      });

      onError((error) => {
        console.error(`${name} 执行失败：`, error);
      });
    }
  );
</script>

<template>
  <div>
    <h2>计数器</h2>
    <p>当前值: {{ count }}</p>
    <p>两倍值: {{ doubleCount }}</p>
    <p>是否为偶数: {{ isEven ? '是' : '否' }}</p>

    <button @click="counterStore.increment()">增加</button>
    <button @click="counterStore.decrement()">减少</button>
    <button @click="counterStore.incrementBy(5)">增加5</button>
    <button @click="counterStore.reset()">重置</button>

    <!-- 直接调用 action -->
    <button @click="counterStore.fetchData()">获取数据</button>
  </div>
</template>
```

#### 2.2.2 Options API 中使用

```vue
<!-- UserProfile.vue -->
<script lang="ts">
  import { defineComponent } from 'vue';
  import { mapState, mapActions } from 'pinia';
  import { useUserStore } from '@/stores/user';

  export default defineComponent({
    computed: {
      // 映射 state
      ...mapState(useUserStore, ['name', 'email', 'age']),

      // 映射 getter
      ...mapState(useUserStore, {
        displayName: 'displayName',
        greeting: 'greeting',
      }),

      // 自定义计算属性
      userInfo() {
        const store = useUserStore();
        return `${store.name} (${store.email})`;
      },
    },

    methods: {
      // 映射 action
      ...mapActions(useUserStore, ['login', 'logout', 'setUserInfo']),

      // 自定义方法
      async handleLogin() {
        const result = await this.login({
          username: 'user',
          password: 'pass',
        });

        if (result.success) {
          this.$router.push('/dashboard');
        }
      },
    },

    mounted() {
      // 在 Options API 中可以直接使用 store
      const store = useUserStore();

      // 订阅状态变化
      this.$subscribe = store.$subscribe((mutation, state) => {
        console.log('用户状态变化');
      });
    },

    beforeUnmount() {
      // 清理订阅
      if (this.$subscribe) {
        this.$subscribe();
      }
    },
  });
</script>
```

## 三、高级用法和最佳实践

### 3.1 模块化 Store 组织

```
src/
├── stores/
│   ├── index.ts           # store 导出
│   ├── modules/
│   │   ├── auth.ts       # 认证相关
│   │   ├── user.ts       # 用户信息
│   │   ├── products.ts   # 产品数据
│   │   ├── cart.ts       # 购物车
│   │   └── settings.ts   # 应用设置
│   └── types/
│       └── index.ts      # 类型定义
```

### 3.2 类型安全的 Store

```typescript
// stores/types/index.ts

// 用户相关类型
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  role: 'user' | 'admin' | 'moderator';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  fontSize: number;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// 产品相关类型
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  rating: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
  addedAt: number;
}

// 通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
```

```typescript
// stores/modules/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthState, ApiResponse } from '../types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const authState = ref<AuthState>({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    expiresAt: parseInt(localStorage.getItem('expiresAt') || '0'),
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => {
    if (!authState.value.token) return false;
    if (!authState.value.expiresAt) return false;
    return Date.now() < authState.value.expiresAt;
  });

  const userRole = computed(() => user.value?.role || 'guest');
  const hasPermission = computed(() => {
    return (requiredRole: User['role']) => {
      const roles: Record<User['role'], number> = {
        guest: 0,
        user: 1,
        moderator: 2,
        admin: 3,
      };
      return roles[userRole.value] >= roles[requiredRole];
    };
  });

  // Actions
  async function login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      // 更新状态
      user.value = data.user;
      authState.value = {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
      };

      // 保存到 localStorage
      saveToLocalStorage();

      return { success: true, data };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authState.value.token}`,
        },
      });
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      // 清除状态
      user.value = null;
      authState.value = { token: null, refreshToken: null, expiresAt: null };
      clearLocalStorage();
    }
  }

  async function refreshToken(): Promise<boolean> {
    if (!authState.value.refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: authState.value.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        authState.value.token = data.token;
        authState.value.expiresAt = Date.now() + data.expiresIn * 1000;
        saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error('刷新 token 失败:', error);
    }

    return false;
  }

  // 私有方法
  function saveToLocalStorage() {
    localStorage.setItem('token', authState.value.token || '');
    localStorage.setItem('refreshToken', authState.value.refreshToken || '');
    localStorage.setItem('expiresAt', (authState.value.expiresAt || 0).toString());
  }

  function clearLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
  }

  // 初始化时从 localStorage 恢复
  function initialize() {
    if (authState.value.token && authState.value.expiresAt) {
      // 检查 token 是否过期
      if (Date.now() >= authState.value.expiresAt) {
        // token 过期，尝试刷新
        refreshToken();
      }
    }
  }

  // 立即执行初始化
  initialize();

  return {
    // State
    user,
    authState,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    hasPermission,

    // Actions
    login,
    logout,
    refreshToken,

    // 私有方法（如果需要暴露）
    initialize,
  };
});
```

### 3.3 Store 组合和复用

```typescript
// stores/composables/useApi.ts
import { ref } from 'vue';

export function useApi<T>() {
  const data = ref<T | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchData(url: string, options?: RequestInit) {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      data.value = result;
      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function clear() {
    data.value = null;
    error.value = null;
  }

  return {
    data,
    isLoading,
    error,
    fetchData,
    clear,
  };
}
```

```typescript
// stores/modules/products.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '../composables/useApi';
import type { Product, PaginationParams } from '../types';

export const useProductsStore = defineStore('products', () => {
  // 使用组合函数
  const api = useApi<Product[]>();

  // 扩展的状态
  const filters = ref({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    search: '',
    inStock: false,
  });

  const pagination = ref<PaginationParams>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    order: 'asc',
  });

  // 计算属性
  const filteredProducts = computed(() => {
    if (!api.data.value) return [];

    return api.data.value.filter((product) => {
      // 按类别过滤
      if (filters.value.category && product.category !== filters.value.category) {
        return false;
      }

      // 按价格过滤
      if (product.price < filters.value.minPrice || product.price > filters.value.maxPrice) {
        return false;
      }

      // 按搜索词过滤
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }

      // 按库存过滤
      if (filters.value.inStock && product.stock === 0) {
        return false;
      }

      return true;
    });
  });

  const totalPages = computed(() => {
    if (!api.data.value) return 0;
    return Math.ceil(filteredProducts.value.length / pagination.value.limit);
  });

  const paginatedProducts = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit;
    const end = start + pagination.value.limit;
    return filteredProducts.value.slice(start, end);
  });

  // Actions
  async function fetchProducts() {
    const queryParams = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      sortBy: pagination.value.sortBy,
      order: pagination.value.order,
    });

    if (filters.value.category) {
      queryParams.append('category', filters.value.category);
    }

    await api.fetchData(`/api/products?${queryParams}`);
  }

  async function fetchProductById(id: number) {
    const productApi = useApi<Product>();
    await productApi.fetchData(`/api/products/${id}`);
    return productApi.data.value;
  }

  function updateFilters(newFilters: Partial<typeof filters.value>) {
    filters.value = { ...filters.value, ...newFilters };
    pagination.value.page = 1; // 重置到第一页
  }

  function updatePagination(newPagination: Partial<PaginationParams>) {
    pagination.value = { ...pagination.value, ...newPagination };
  }

  function resetFilters() {
    filters.value = {
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      search: '',
      inStock: false,
    };
    pagination.value.page = 1;
  }

  // 初始化
  fetchProducts();

  return {
    // State
    products: api.data,
    isLoading: api.isLoading,
    error: api.error,
    filters,
    pagination,

    // Getters
    filteredProducts,
    paginatedProducts,
    totalPages,

    // Actions
    fetchProducts,
    fetchProductById,
    updateFilters,
    updatePagination,
    resetFilters,
    clear: api.clear,
  };
});
```

### 3.4 Store 之间通信

```typescript
// stores/modules/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProductsStore } from './products';
import type { CartItem } from '../types';

export const useCartStore = defineStore('cart', () => {
  const productsStore = useProductsStore();

  // State
  const items = ref<CartItem[]>([]);
  const isCartOpen = ref(false);

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      const product = productsStore.products.value?.find((p) => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  });

  const cartProducts = computed(() => {
    return items.value
      .map((item) => {
        const product = productsStore.products.value?.find((p) => p.id === item.productId);
        return {
          ...item,
          product,
          totalPrice: (product?.price || 0) * item.quantity,
        };
      })
      .filter((item) => item.product); // 过滤掉找不到产品的项目
  });

  // Actions
  function addToCart(productId: number, quantity: number = 1) {
    const existingItem = items.value.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({
        productId,
        quantity,
        addedAt: Date.now(),
      });
    }

    // 自动打开购物车
    isCartOpen.value = true;

    // 保存到 localStorage
    saveToLocalStorage();
  }

  function removeFromCart(productId: number) {
    const index = items.value.findIndex((item) => item.productId === productId);
    if (index > -1) {
      items.value.splice(index, 1);
      saveToLocalStorage();
    }
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find((item) => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
        saveToLocalStorage();
      }
    }
  }

  function clearCart() {
    items.value = [];
    localStorage.removeItem('cart');
  }

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value;
  }

  // 私有方法
  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value));
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        items.value = JSON.parse(saved);
      } catch (error) {
        console.error('加载购物车数据失败:', error);
      }
    }
  }

  // 初始化
  loadFromLocalStorage();

  return {
    // State
    items,
    isCartOpen,

    // Getters
    totalItems,
    totalPrice,
    cartProducts,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
  };
});
```

## 四、最佳实践和规范

### 4.1 命名规范

```typescript
// ✅ 正确命名
export const useUserStore = defineStore('user', () => {});
export const useAuthStore = defineStore('auth', () => {});
export const useProductsStore = defineStore('products', () => {});

// ❌ 错误命名
export const userStore = defineStore('user', () => {}); // 缺少 use 前缀
export const UserStore = defineStore('user', () => {}); // 不应该大写
```

### 4.2 文件组织规范

```
src/stores/
├── index.ts                    # 统一导出所有 store
├── modules/                    # 业务模块 store
│   ├── auth.ts
│   ├── user.ts
│   ├── products.ts
│   ├── cart.ts
│   └── settings.ts
├── composables/               # 可复用的组合函数
│   ├── useApi.ts
│   ├── useLocalStorage.ts
│   └── useValidation.ts
├── utils/                     # store 工具函数
│   ├── helpers.ts
│   └── validators.ts
└── types/                     # TypeScript 类型定义
    ├── index.ts
    ├── auth.types.ts
    └── products.types.ts
```

### 4.3 代码规范

```typescript
// ✅ 良好实践
export const useCounterStore = defineStore('counter', () => {
  // 1. 先定义 state
  const count = ref(0);

  // 2. 再定义 getters（计算属性）
  const doubleCount = computed(() => count.value * 2);

  // 3. 最后定义 actions
  function increment() {
    count.value++;
  }

  // 4. 返回所有内容
  return {
    count,
    doubleCount,
    increment,
  };
});

// ✅ 异步 action 处理错误
async function fetchData() {
  try {
    isLoading.value = true;
    const data = await api.fetch('/data');
    return { success: true, data };
  } catch (error) {
    console.error('获取数据失败:', error);
    return { success: false, error: error.message };
  } finally {
    isLoading.value = false;
  }
}

// ✅ 使用 storeToRefs 保持响应式
import { storeToRefs } from 'pinia';
const store = useCounterStore();
const { count, doubleCount } = storeToRefs(store);

// ❌ 不要直接解构
const { count, doubleCount } = store; // 会失去响应性！

// ✅ 批量修改使用 $patch
store.$patch({
  count: 10,
  name: '新名称',
});

// ✅ 或使用函数形式的 $patch
store.$patch((state) => {
  state.count++;
  state.items.push(newItem);
});
```

### 4.4 性能优化

```typescript
// 1. 避免不必要的响应式
export const useStore = defineStore('store', () => {
  // ✅ 常量应该放在外部
  const CONSTANTS = {
    API_URL: '/api',
    TIMEOUT: 5000,
  };

  // ❌ 不要放在响应式数据中
  const config = ref({
    apiUrl: '/api', // 这些值不会改变，不需要响应式
    timeout: 5000,
  });

  return { CONSTANTS };
});

// 2. 使用计算属性缓存
const expensiveValue = computed(() => {
  // 复杂的计算逻辑
  return heavyCalculation(state.data);
});

// 3. 懒加载 store
function useLazyStore() {
  // 按需导入 store
  const store = useSomeStore();

  onUnmounted(() => {
    // 清理 store
    store.$dispose();
  });

  return store;
}

// 4. 使用防抖/节流
import { debounce, throttle } from 'lodash-es';

export const useSearchStore = defineStore('search', () => {
  const query = ref('');
  const results = ref([]);

  // 使用防抖搜索
  const debouncedSearch = debounce(async () => {
    if (!query.value.trim()) return;

    const response = await fetch(`/api/search?q=${query.value}`);
    results.value = await response.json();
  }, 300);

  function updateQuery(newQuery: string) {
    query.value = newQuery;
    debouncedSearch();
  }

  return { query, results, updateQuery };
});
```

### 4.5 测试规范

```typescript
// stores/__tests__/counter.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useCounterStore } from '../counter';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Counter Store', () => {
  beforeEach(() => {
    // 创建一个新的 pinia 实例
    setActivePinia(createPinia());
  });

  it('should initialize with count 0', () => {
    const store = useCounterStore();
    expect(store.count).toBe(0);
  });

  it('should increment count', () => {
    const store = useCounterStore();
    store.increment();
    expect(store.count).toBe(1);
  });

  it('should decrement count', () => {
    const store = useCounterStore();
    store.decrement();
    expect(store.count).toBe(-1);
  });

  it('should compute double count', () => {
    const store = useCounterStore();
    store.count = 5;
    expect(store.doubleCount).toBe(10);
  });

  it('should reset count', () => {
    const store = useCounterStore();
    store.count = 10;
    store.reset();
    expect(store.count).toBe(0);
  });

  it('should handle async action', async () => {
    const store = useCounterStore();
    await store.fetchData();
    // 测试异步逻辑
  });
});
```

### 4.6 安全规范

```typescript
// 1. 敏感数据不存储在 store 中
export const useAuthStore = defineStore('auth', () => {
  // ❌ 不要把敏感信息明文存储
  const password = ref(''); // 危险！

  // ✅ 只存储 token 或加密后的数据
  const token = ref('');

  return { token };
});

// 2. 数据验证
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  function setUser(newUser: unknown) {
    // 验证数据格式
    if (!isValidUser(newUser)) {
      throw new Error('无效的用户数据');
    }

    // 深度克隆避免引用问题
    user.value = deepClone(newUser);
  }

  return { user, setUser };
});

// 3. 权限控制
export const useAdminStore = defineStore('admin', () => {
  const { hasPermission } = useAuthStore();

  function deleteUser(userId: number) {
    if (!hasPermission('admin')) {
      throw new Error('权限不足');
    }

    // 执行删除操作
  }

  return { deleteUser };
});
```

## 五、常见问题解决

### 5.1 循环依赖问题

```typescript
// stores/modules/a.ts
import { useBStore } from './b';

export const useAStore = defineStore('a', () => {
  const bStore = useBStore();

  // 使用 bStore
  const value = computed(() => bStore.someValue);

  return { value };
});

// stores/modules/b.ts
// ❌ 错误的循环引用
import { useAStore } from './a';

export const useBStore = defineStore('b', () => {
  // 这里不能直接导入 useAStore
  // 应该在使用时再导入
  const getAStore = () => {
    const { useAStore } = require('./a');
    return useAStore();
  };

  // 或者在 action 中获取
  function someAction() {
    const aStore = useAStore();
    // 使用 aStore
  }

  return { someAction };
});
```

### 5.2 SSR 支持

```typescript
// 在 Nuxt.js 中使用 Pinia
// https://pinia.vuejs.org/ssr/nuxt.html

// stores/index.ts
import { defineNuxtPlugin } from '#app';
import { createPinia } from 'pinia';

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
});
```

### 5.3 持久化存储

```typescript
// 使用 pinia-plugin-persistedstate
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// store 中使用
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    preferences: {},
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage,
        paths: ['name', 'preferences'],
      },
    ],
  },
});
```

## 六、总结

Pinia 提供了比 Vuex 更简洁、更强大的状态管理方案。关键要点：

1. **使用 Composition API 风格**：更符合 Vue 3 的设计理念
2. **保持 TypeScript 类型安全**：充分利用类型推断
3. **合理组织 store 结构**：按业务模块划分
4. **遵循最佳实践**：使用 `storeToRefs`、`$patch` 等
5. **考虑性能优化**：避免不必要的响应式
6. **编写可测试的代码**：便于单元测试

通过遵循这些规范和最佳实践，可以构建出可维护、可扩展、高性能的 Vue 应用状态管理系统。
