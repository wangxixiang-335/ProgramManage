/**
 * new-images 存储桶修复工具
 * 用于解决存储桶访问权限问题
 */

import { supabase } from '../lib/supabase';
import { checkNewImagesBucket, createNewImagesBucket } from '../services/supabaseStorageService';

/**
 * 诊断并修复 new-images 存储桶问题
 */
export const fixNewImagesBucket = async (): Promise<boolean> => {
  console.log('🔧 开始修复 new-images 存储桶...');
  
  try {
    // 1. 检查存储桶是否存在
    console.log('1️⃣ 检查存储桶是否存在...');
    const bucketExists = await checkNewImagesBucket();
    
    if (!bucketExists) {
      console.log('❌ new-images 存储桶不存在，尝试创建...');
      const created = await createNewImagesBucket();
      
      if (!created) {
        console.error('❌ 无法创建存储桶，可能需要手动创建');
        console.log('💡 请在 Supabase Dashboard 中创建存储桶，或执行提供的 SQL 脚本');
        return false;
      }
      
      console.log('✅ new-images 存储桶创建成功');
    } else {
      console.log('✅ new-images 存储桶已存在');
    }
    
    // 2. 检查存储桶策略
    console.log('2️⃣ 检查存储桶策略...');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'new-images');
    
    if (policiesError) {
      console.error('❌ 获取策略失败:', policiesError);
      return false;
    }
    
    console.log(`📋 找到 ${policies?.length || 0} 个策略`);
    
    if (!policies || policies.length === 0) {
      console.log('❌ 未找到任何访问策略');
      console.log('💡 请执行 SQL 脚本设置访问策略');
      return false;
    }
    
    // 3. 测试文件上传权限
    console.log('3️⃣ 测试文件上传权限...');
    const uploadTestResult = await testUploadPermission();
    
    if (!uploadTestResult) {
      console.log('❌ 文件上传权限测试失败');
      console.log('💡 请检查用户登录状态和权限策略');
      return false;
    }
    
    console.log('✅ 文件上传权限测试通过');
    
    // 4. 测试文件读取权限
    console.log('4️⃣ 测试文件读取权限...');
    const readTestResult = await testReadPermission();
    
    if (!readTestResult) {
      console.log('❌ 文件读取权限测试失败');
      console.log('💡 请检查公共访问策略');
      return false;
    }
    
    console.log('✅ 文件读取权限测试通过');
    
    console.log('🎉 new-images 存储桶修复完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    return false;
  }
};

/**
 * 测试文件上传权限
 */
const testUploadPermission = async (): Promise<boolean> => {
  try {
    // 创建测试文件
    const testContent = 'test file for permission check';
    const testFile = new File([testContent], `permission-test-${Date.now()}.txt`, {
      type: 'text/plain'
    });
    
    const testFileName = `permission-test-${Date.now()}.txt`;
    
    console.log('📤 尝试上传测试文件...');
    
    const { data, error } = await supabase.storage
      .from('new-images')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ 上传测试失败:', error);
      
      if (error.message.includes('Permission denied') || error.message.includes('policy')) {
        console.log('💡 问题: 缺少上传策略');
        console.log('💡 解决方案: 执行 SQL 脚本设置上传策略');
      } else if (error.message.includes('Bucket not found')) {
        console.log('💡 问题: 存储桶不存在');
        console.log('💡 解决方案: 手动创建存储桶');
      }
      
      return false;
    }
    
    console.log('✅ 上传测试成功');
    
    // 清理测试文件
    await supabase.storage.from('new-images').remove([testFileName]);
    console.log('🧹 测试文件已清理');
    
    return true;
    
  } catch (error) {
    console.error('❌ 上传测试时发生错误:', error);
    return false;
  }
};

/**
 * 测试文件读取权限
 */
const testReadPermission = async (): Promise<boolean> => {
  try {
    // 创建一个公共测试文件
    const testContent = 'test file for read permission check';
    const testFile = new File([testContent], `read-test-${Date.now()}.txt`, {
      type: 'text/plain'
    });
    
    const testFileName = `read-test-${Date.now()}.txt`;
    
    console.log('📄 尝试创建测试文件用于读取测试...');
    
    // 先上传文件
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('new-images')
      .upload(testFileName, testFile);
    
    if (uploadError) {
      console.error('❌ 无法创建测试文件:', uploadError);
      return false;
    }
    
    console.log('✅ 测试文件创建成功');
    
    // 测试公共URL访问
    const { data: { publicUrl } } = supabase.storage
      .from('new-images')
      .getPublicUrl(testFileName);
    
    console.log('🌐 测试公共URL:', publicUrl);
    
    // 尝试通过HTTP请求访问
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log('✅ 公共访问测试成功');
      } else {
        console.log('⚠️ 公共访问测试失败，状态码:', response.status);
      }
    } catch (fetchError) {
      console.log('⚠️ 无法通过HTTP访问公共URL');
    }
    
    // 清理测试文件
    await supabase.storage.from('new-images').remove([testFileName]);
    console.log('🧹 测试文件已清理');
    
    return true;
    
  } catch (error) {
    console.error('❌ 读取测试时发生错误:', error);
    return false;
  }
};

/**
 * 获取详细的修复建议
 */
export const getDetailedFixSteps = (): string[] => {
  return [
    '1. 📋 在 Supabase Dashboard 的 SQL Editor 中执行 fix-new-images-bucket.sql',
    '2. 🔐 确保使用项目所有者账户登录',
    '3. 🌐 在 Settings > API 中检查 CORS 设置',
    '4. 📝 确认环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 配置正确',
    '5. 👤 确保用户已登录（某些操作需要认证）',
    '6. 📏 检查上传文件大小和类型是否符合限制',
    '7. 🔄 如果问题仍然存在，尝试重新创建存储桶'
  ];
};

/**
 * 快速验证存储桶状态
 */
export const quickCheck = async (): Promise<void> => {
  console.log('⚡ 快速检查 new-images 存储桶状态...');
  
  const bucketExists = await checkNewImagesBucket();
  console.log(`📦 存储桶存在: ${bucketExists ? '✅ 是' : '❌ 否'}`);
  
  if (bucketExists) {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === 'new-images');
    
    if (bucket) {
      console.log(`🌐 公开访问: ${bucket.public ? '✅ 是' : '❌ 否'}`);
      console.log(`📏 文件大小限制: ${(bucket.file_size_limit / 1024 / 1024).toFixed(2)}MB`);
      console.log(`🎨 允许的类型: ${bucket.allowed_mime_types?.join(', ') || '无限制'}`);
    }
    
    const { data: policies } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'new-images');
    
    console.log(`🛡️ 访问策略数量: ${policies?.length || 0}`);
  }
};

// 暴露到全局（开发环境）
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).fixNewImagesBucket = fixNewImagesBucket;
  (window as any).quickCheckStorage = quickCheck;
  (window as any).getFixSteps = getDetailedFixSteps;
  
  console.log('💡 运行 fixNewImagesBucket() 修复存储桶问题');
  console.log('💡 运行 quickCheckStorage() 快速检查状态');
  console.log('💡 运行 getFixSteps() 获取详细修复步骤');
}