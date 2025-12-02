/**
 * Supabase存储功能测试工具
 * 仅用于开发环境测试
 */

import { 
  createNewsImagesBucket, 
  checkNewsImagesBucket, 
  listNewsImages,
  uploadNewsImage,
  getNewsImageUrl
} from '../services/supabaseStorageService';

/**
 * 测试存储桶功能
 */
export const testStorageFeatures = async (): Promise<void> => {
  console.log('🧪 开始测试Supabase存储功能...');
  
  try {
    // 1. 检查存储桶是否存在
    console.log('📦 检查存储桶状态...');
    const bucketExists = await checkNewsImagesBucket();
    console.log(bucketExists ? '✅ 存储桶已存在' : '❌ 存储桶不存在');
    
    // 2. 创建存储桶（如果不存在）
    if (!bucketExists) {
      console.log('🔨 创建存储桶...');
      const created = await createNewsImagesBucket();
      console.log(created ? '✅ 存储桶创建成功' : '❌ 存储桶创建失败');
    }
    
    // 3. 列出现有文件
    console.log('📋 列出现有文件...');
    const files = await listNewsImages();
    console.log(`找到 ${files.length} 个文件`);
    files.forEach(file => {
      console.log(`  - ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
    });
    
    // 4. 测试图片上传（可选）
    console.log('📤 准备测试上传...');
    // 创建一个小的测试图片
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('TEST', 25, 55);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], `test-${Date.now()}.png`, { type: 'image/png' });
          console.log('📤 上传测试图片...');
          const imageUrl = await uploadNewsImage(testFile);
          if (imageUrl) {
            console.log('✅ 测试上传成功:', imageUrl);
          } else {
            console.log('❌ 测试上传失败');
          }
        }
      }, 'image/png');
    }
    
    console.log('🎉 存储功能测试完成');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
};

/**
 * 在浏览器控制台中运行测试
 */
export const runStorageTest = (): void => {
  // 仅在开发环境中可用
  if (import.meta.env.DEV) {
    console.log('🚀 开始运行存储测试...');
    testStorageFeatures();
  } else {
    console.warn('⚠️ 存储测试仅在开发环境中可用');
  }
};

// 开发环境下自动暴露到全局
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).testSupabaseStorage = runStorageTest;
  console.log('💡 在控制台运行 testSupabaseStorage() 来测试存储功能');
}