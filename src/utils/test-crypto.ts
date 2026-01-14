import { encryptData, decryptData, hashSHA256, hashMD5 } from './crypto';

declare const console: {
  log(...data: any[]): void;
};

// 测试加密解密功能
export function testCryptoFunctionality() {
  console.log('=== 加密功能测试 ===');

  // 测试数据
  const testData = {
    username: 'testuser',
    password: 'secretpassword123',
    email: 'test@example.com',
  };

  console.log('原始数据:', testData);

  // 测试加密
  const encrypted = encryptData(testData);
  console.log('加密后数据:', encrypted);

  // 测试解密
  const decrypted = decryptData(encrypted);
  console.log('解密后数据:', decrypted);

  // 验证数据一致性
  const isConsistent = JSON.stringify(testData) === JSON.stringify(decrypted);
  console.log('数据一致性验证:', isConsistent ? '通过' : '失败');

  // 测试哈希功能
  const testString = 'Hello World';
  console.log('\n=== 哈希功能测试 ===');
  console.log('测试字符串:', testString);
  console.log('SHA256哈希:', hashSHA256(testString));
  console.log('MD5哈希:', hashMD5(testString));

  return {
    original: testData,
    encrypted,
    decrypted,
    consistent: isConsistent,
  };
}

// 如果直接运行此文件，则执行测试
if (typeof window !== 'undefined' && window.location) {
  testCryptoFunctionality();
}
