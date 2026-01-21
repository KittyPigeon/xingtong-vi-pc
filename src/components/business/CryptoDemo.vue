<template>
  <div class="crypto-demo">
    <h2>API加解密功能演示</h2>

    <div class="demo-section">
      <h3>数据加密</h3>
      <a-textarea v-model:value="inputData" placeholder="请输入要加密的数据" :rows="4" />
      <div class="actions">
        <a-button type="primary" :loading="isEncrypting" @click="handleEncrypt">
          加密数据
        </a-button>
        <a-button @click="clearEncrypted">清空</a-button>
      </div>
      <div v-if="encryptedData" class="result">
        <h4>加密结果：</h4>
        <a-textarea v-model:value="encryptedData" :rows="3" :readonly="true" />
      </div>
    </div>

    <div class="demo-section">
      <h3>数据解密</h3>
      <a-textarea v-model:value="encryptedInput" placeholder="请输入要解密的数据" :rows="4" />
      <div class="actions">
        <a-button type="primary" :loading="isDecrypting" @click="handleDecrypt">
          解密数据
        </a-button>
        <a-button @click="clearDecrypted">清空</a-button>
      </div>
      <div v-if="decryptedData" class="result">
        <h4>解密结果：</h4>
        <a-textarea v-model:value="decryptedData" :rows="3" :readonly="true" />
      </div>
    </div>

    <div class="demo-section">
      <h3>哈希计算</h3>
      <a-input v-model:value="hashInput" placeholder="请输入要计算哈希的数据" />
      <div class="actions">
        <a-button @click="calculateSHA256">SHA256</a-button>
        <a-button @click="calculateMD5">MD5</a-button>
        <a-button @click="clearHash">清空</a-button>
      </div>
      <div v-if="hashResult" class="result">
        <h4>哈希结果：</h4>
        <a-input v-model:value="hashResult" :readonly="true" />
      </div>
    </div>

    <div v-if="cryptoError" class="error">
      <a-alert :message="cryptoError" type="error" show-icon closable @close="cryptoError = null" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useCrypto } from '@/composables/useCrypto';

  // 输入数据
  const inputData = ref<string>('');
  const encryptedInput = ref<string>('');
  const hashInput = ref<string>('');

  // 输出数据
  const encryptedData = ref<string>('');
  const decryptedData = ref<string>('');
  const hashResult = ref<string>('');

  // 使用加密Hook
  const {
    encrypt,
    decrypt,
    sha256,
    md5,
    isEncrypting,
    isDecrypting,
    error: cryptoError,
  } = useCrypto();

  // 处理加密
  const handleEncrypt = async () => {
    if (!inputData.value) {
      cryptoError.value = '请输入要加密的数据';
      return;
    }

    try {
      // 尝试将输入解析为JSON对象，如果失败则作为字符串处理
      let dataToEncrypt: unknown;
      try {
        dataToEncrypt = JSON.parse(inputData.value);
      } catch {
        dataToEncrypt = inputData.value;
      }

      encryptedData.value = await encrypt(dataToEncrypt);
    } catch (error) {
      cryptoError.value = error instanceof Error ? error.message : '加密失败';
    }
  };

  // 处理解密
  const handleDecrypt = async () => {
    if (!encryptedInput.value) {
      cryptoError.value = '请输入要解密的数据';
      return;
    }

    try {
      const result = await decrypt(encryptedInput.value);
      decryptedData.value = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    } catch (error) {
      cryptoError.value = error instanceof Error ? error.message : '解密失败';
    }
  };

  // 计算SHA256
  const calculateSHA256 = () => {
    if (!hashInput.value) {
      cryptoError.value = '请输入要计算哈希的数据';
      return;
    }

    try {
      hashResult.value = sha256(hashInput.value);
    } catch (error) {
      cryptoError.value = error instanceof Error ? error.message : 'SHA256计算失败';
    }
  };

  // 计算MD5
  const calculateMD5 = () => {
    if (!hashInput.value) {
      cryptoError.value = '请输入要计算哈希的数据';
      return;
    }

    try {
      hashResult.value = md5(hashInput.value);
    } catch (error) {
      cryptoError.value = error instanceof Error ? error.message : 'MD5计算失败';
    }
  };

  // 清空加密结果
  const clearEncrypted = () => {
    encryptedData.value = '';
    inputData.value = '';
  };

  // 清空解密结果
  const clearDecrypted = () => {
    decryptedData.value = '';
    encryptedInput.value = '';
  };

  // 清空哈希结果
  const clearHash = () => {
    hashResult.value = '';
    hashInput.value = '';
  };
</script>

<style scoped lang="scss">
  .crypto-demo {
    max-width: 800px;
    padding: 20px;
    margin: 0 auto;

    .demo-section {
      padding: 20px;
      margin-bottom: 30px;
      background-color: #fafafa;
      border: 1px solid #e4e7ed;
      border-radius: 8px;

      h3 {
        margin-top: 0;
        color: #303133;
      }

      .actions {
        margin: 15px 0;

        .ant-btn {
          margin-right: 10px;
        }
      }

      .result {
        margin-top: 15px;

        h4 {
          margin: 10px 0 5px;
          color: #606266;
        }
      }
    }

    .error {
      margin-top: 20px;
    }
  }
</style>
