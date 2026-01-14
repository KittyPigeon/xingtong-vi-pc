import CryptoJS from 'crypto-js';

// 加密配置
interface CryptoConfig {
  enableEncryption: boolean;
  algorithm: 'AES' | 'DES' | 'Rabbit' | 'RC4';
  secretKey: string;
}

// 默认配置
const defaultConfig: CryptoConfig = {
  enableEncryption: import.meta.env.VITE_ENABLE_ENCRYPTION === 'true',
  algorithm: (import.meta.env.VITE_CRYPTO_ALGORITHM as 'AES' | 'DES' | 'Rabbit' | 'RC4') || 'AES',
  secretKey: import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key',
};

/**
 * 加密数据
 * @param data 需要加密的数据
 * @param config 加密配置
 * @returns 加密后的数据
 */
export function encryptData(data: unknown, config: Partial<CryptoConfig> = {}): string {
  // 如果未启用加密，直接返回JSON字符串
  const finalConfig = { ...defaultConfig, ...config };
  if (!finalConfig.enableEncryption) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  // 将数据转换为JSON字符串
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);

  // 根据算法进行加密
  switch (finalConfig.algorithm) {
    case 'AES':
      return CryptoJS.AES.encrypt(dataString, finalConfig.secretKey).toString();
    case 'DES':
      return CryptoJS.DES.encrypt(dataString, finalConfig.secretKey).toString();
    case 'Rabbit':
      return CryptoJS.Rabbit.encrypt(dataString, finalConfig.secretKey).toString();
    case 'RC4':
      return CryptoJS.RC4.encrypt(dataString, finalConfig.secretKey).toString();
    default:
      return CryptoJS.AES.encrypt(dataString, finalConfig.secretKey).toString();
  }
}

/**
 * 解密数据
 * @param encryptedData 加密的数据
 * @param config 解密配置
 * @returns 解密后的数据
 */
export function decryptData(encryptedData: string, config: Partial<CryptoConfig> = {}): unknown {
  // 如果未启用加密，直接解析JSON
  const finalConfig = { ...defaultConfig, ...config };
  if (!finalConfig.enableEncryption) {
    try {
      return JSON.parse(encryptedData);
    } catch {
      return encryptedData;
    }
  }

  // 根据算法进行解密
  let decrypted;
  switch (finalConfig.algorithm) {
    case 'AES':
      decrypted = CryptoJS.AES.decrypt(encryptedData, finalConfig.secretKey);
      break;
    case 'DES':
      decrypted = CryptoJS.DES.decrypt(encryptedData, finalConfig.secretKey);
      break;
    case 'Rabbit':
      decrypted = CryptoJS.Rabbit.decrypt(encryptedData, finalConfig.secretKey);
      break;
    case 'RC4':
      decrypted = CryptoJS.RC4.decrypt(encryptedData, finalConfig.secretKey);
      break;
    default:
      decrypted = CryptoJS.AES.decrypt(encryptedData, finalConfig.secretKey);
  }

  try {
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch {
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

/**
 * 生成随机密钥
 * @param length 密钥长度
 * @returns 随机密钥
 */
export function generateRandomKey(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * SHA256哈希
 * @param data 数据
 * @returns 哈希值
 */
export function hashSHA256(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * MD5哈希
 * @param data 数据
 * @returns 哈希值
 */
export function hashMD5(data: string): string {
  return CryptoJS.MD5(data).toString();
}

// 导出默认配置
export { defaultConfig };
export type { CryptoConfig };
