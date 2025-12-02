import { createNewImagesBucket, checkNewImagesBucket } from '../services/supabaseStorageService';

/**
 * 初始化Supabase存储
 * 创建必要的存储桶
 */
export const initializeSupabaseStorage = async (): Promise<void> => {
  console.log('开始初始化Supabase存储...');
  
  try {
    // 检查new-images桶是否存在
    const bucketExists = await checkNewImagesBucket();
    
    if (!bucketExists) {
      console.log('new-images桶不存在，正在创建...');
      const created = await createNewImagesBucket();
      
      if (created) {
        console.log('✅ new-images存储桶创建成功');
      } else {
        console.error('❌ new-images存储桶创建失败');
      }
    } else {
      console.log('✅ new-images存储桶已存在');
    }
    
    console.log('Supabase存储初始化完成');
  } catch (error) {
    console.error('❌ 初始化Supabase存储时发生错误:', error);
  }
};

// 可以在应用启动时调用此函数
export const setupStorageOnInit = (): void => {
  // 延迟执行以确保Supabase客户端已初始化
  setTimeout(() => {
    initializeSupabaseStorage();
  }, 1000);
};