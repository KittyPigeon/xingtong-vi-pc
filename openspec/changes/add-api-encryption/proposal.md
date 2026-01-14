# Change: 添加API请求响应加解密功能

## Why

为了提高系统的安全性，保护敏感数据在传输过程中的安全，需要对API请求和响应数据进行加密处理。这对于防止数据泄露、中间人攻击等安全威胁至关重要。

## What Changes

- 添加API请求数据加密功能
- 添加API响应数据解密功能
- 实现统一的加解密工具类
- 集成到现有的HTTP客户端中
- 添加密钥管理和配置选项
- 创建完整的使用文档和示例

## Impact

- Affected specs: api-security
- Affected code: api/http.ts, utils/crypto, composables/useApi
- Added documentation: 加密功能使用说明.md
- Added demo: CryptoDemo.vue, CryptoDemoView.vue

## Status

Completed. API加解密功能已完全实现并集成到项目中，包含完整的工具类、HTTP客户端集成、使用示例和文档说明。
