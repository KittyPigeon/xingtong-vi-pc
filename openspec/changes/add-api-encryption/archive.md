# API加解密功能实现归档

## 概述

本文档归档了前端API加解密功能的完整实现，包括设计决策、核心组件、使用方法和安全建议。

## 核心组件

### 1. 加密工具类 (`src/utils/crypto.ts`)

提供了基础的加解密和哈希功能：

- `encryptData`: 数据加密函数
- `decryptData`: 数据解密函数
- `generateRandomKey`: 随机密钥生成
- `hashSHA256`: SHA256哈希计算
- `hashMD5`: MD5哈希计算

### 2. 加密Hook (`src/composables/useCrypto.ts`)

提供了响应式的加解密功能，可在Vue组件中直接使用：

- `encrypt`: 异步加密函数
- `decrypt`: 异步解密函数
- `sha256`: SHA256哈希计算
- `md5`: MD5哈希计算
- 响应式状态：`isEncrypting`, `isDecrypting`, `error`

### 3. HTTP客户端集成 (`src/api/http.ts`)

在Axios拦截器中集成了自动加解密功能：

- 请求拦截器：自动加密请求数据
- 响应拦截器：自动解密响应数据
- 支持每个请求单独配置加解密选项

## 设计决策

### 1. 加密算法选择

当前实现支持以下对称加密算法：

- AES（推荐用于大量数据）
- DES
- Rabbit
- RC4

### 2. 集成方式

选择将加解密功能集成到Axios拦截器中，优势包括：

- 无需修改现有API调用代码
- 统一处理所有HTTP请求
- 支持细粒度的请求级配置

### 3. 配置管理

通过环境变量管理加密配置：

- `VITE_ENABLE_ENCRYPTION`: 控制是否启用加密功能
- `VITE_CRYPTO_ALGORITHM`: 指定加密算法
- `VITE_CRYPTO_SECRET_KEY`: 设置加密密钥

## 使用方法

### 1. 基础加解密

```typescript
import { encryptData, decryptData } from '@/utils/crypto';

// 加密对象
const userData = { username: 'john', password: 'secret123' };
const encrypted = encryptData(userData);

// 解密数据
const decrypted = decryptData(encrypted);
```

### 2. 在Vue组件中使用

```typescript
import { useCrypto } from '@/composables/useCrypto';

const { encrypt, decrypt, isEncrypting, isDecrypting, error } = useCrypto();

const handleEncrypt = async () => {
  try {
    const encrypted = await encrypt({ sensitive: 'data' });
  } catch (err) {
    console.error('加密失败:', err);
  }
};
```

### 3. API调用中使用加密

```typescript
import http from './http';

// 为特定请求配置加解密
const config = {
  encryptionConfig: {
    enableEncryption: true,
    encryptRequest: true,
    decryptResponse: true,
  },
};

http.post('/auth/login', { username, password }, config);
```

## 安全建议

1. **密钥管理**：
   - 不要在代码中硬编码密钥
   - 使用环境变量存储密钥
   - 定期轮换密钥

2. **算法选择**：
   - 对于大量数据，推荐使用AES
   - 根据安全需求选择合适的算法

3. **传输安全**：
   - 始终配合HTTPS使用
   - 敏感操作建议二次验证

## 文件结构

```
src/
├── utils/
│   ├── crypto.ts          # 加密工具类
│   └── test-crypto.ts     # 测试文件
├── composables/
│   └── useCrypto.ts       # 加密Hook
├── api/
│   ├── http.ts            # HTTP客户端（已集成加密）
│   └── crypto-demo.ts     # 加密API示例
├── components/
│   └── business/
│       └── CryptoDemo.vue # 加密演示组件
└── views/
    └── CryptoDemoView.vue # 加密演示页面
```

## 测试验证

项目包含完整的测试验证机制：

1. 单元测试覆盖核心加解密函数
2. 集成测试验证HTTP客户端的加解密功能
3. 演示页面可用于手动验证功能

## 版本信息

- 实现日期：2025年12月
- 技术栈：Vue 3, TypeScript, Axios, CryptoJS
- 支持的加密算法：AES, DES, Rabbit, RC4

---

_此文档归档了API加解密功能的完整实现细节，作为项目技术文档的一部分。_
