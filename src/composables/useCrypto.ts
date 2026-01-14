import { ref, Ref } from 'vue';
import {
  encryptData,
  decryptData,
  generateRandomKey,
  hashSHA256,
  hashMD5,
  type CryptoConfig,
} from '@/utils/crypto';

/**
 * 加密Hook
 * 提供便捷的加解密功能
 */
export function useCrypto(config?: Partial<CryptoConfig>) {
  // 加密状态
  const isEncrypting = ref<boolean>(false);
  const isDecrypting = ref<boolean>(false);

  // 错误信息
  const error = ref<string | null>(null);

  /**
   * 加密数据
   * @param data 需要加密的数据
   * @returns 加密后的字符串
   */
  const encrypt = async (data: unknown): Promise<string> => {
    try {
      isEncrypting.value = true;
      error.value = null;
      return encryptData(data, config);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加密失败';
      throw err;
    } finally {
      isEncrypting.value = false;
    }
  };

  /**
   * 解密数据
   * @param encryptedData 加密的数据
   * @returns 解密后的数据
   */
  const decrypt = async (encryptedData: string): Promise<unknown> => {
    try {
      isDecrypting.value = true;
      error.value = null;
      return decryptData(encryptedData, config);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '解密失败';
      throw err;
    } finally {
      isDecrypting.value = false;
    }
  };

  /**
   * 生成随机密钥
   * @param length 密钥长度
   * @returns 随机密钥
   */
  const generateKey = (length: number = 32): string => {
    return generateRandomKey(length);
  };

  /**
   * SHA256哈希
   * @param data 数据
   * @returns 哈希值
   */
  const sha256 = (data: string): string => {
    return hashSHA256(data);
  };

  /**
   * MD5哈希
   * @param data 数据
   * @returns 哈希值
   */
  const md5 = (data: string): string => {
    return hashMD5(data);
  };

  return {
    // 状态
    isEncrypting: isEncrypting as Ref<boolean>,
    isDecrypting: isDecrypting as Ref<boolean>,
    error: error as Ref<string | null>,

    // 方法
    encrypt,
    decrypt,
    generateKey,
    sha256,
    md5,
  };
}

// 导出类型
export type { CryptoConfig };
