/**
 * 存储访问调试工具
 * 用于诊断 news-images 存储桶的访问问题
 */

import { supabase } from '../lib/supabase';
import { checkNewImagesBucket, listNewImages } from '../services/supabaseStorageService';

/**
 * 完整的存储访问诊断
 */
export const debugStorageAccess = async (): Promise<void> => {
  console.log('🔍 开始诊断 new-images 存储桶访问...');
  
  try {
    // 1. 检查Supabase连接
    console.log('\n📡 检查Supabase连接...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Supabase连接失败:', sessionError);
      return;
    }
    
    console.log('✅ Supabase连接成功');
    console.log('👤 用户状态:', session ? '已登录' : '匿名访问');
    
    // 2. 检查存储桶列表
    console.log('\n📦 检查存储桶列表...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError);
      console.error('错误详情:', JSON.stringify(bucketsError, null, 2));
      return;
    }
    
    console.log('✅ 存储桶列表获取成功');
    console.log('📋 所有存储桶:', buckets?.map(b => b.name).join(', ') || '无');
    
    // 3. 检查new-images存储桶是否存在
    console.log('\n🎯 检查 new-images 存储桶...');
    const bucketExists = await checkNewImagesBucket();
    
    if (!bucketExists) {
      console.error('❌ new-images 存储桶不存在');
      console.log('💡 建议执行SQL语句创建存储桶');
      return;
    }
    
    console.log('✅ new-images 存储桶存在');
    
    // 4. 尝试列出存储桶中的文件
    console.log('\n📁 尝试列出 new-images 存储桶中的文件...');
    const files = await listNewImages();
    
    console.log('✅ 文件列表获取成功');
    console.log(`📄 找到 ${files.length} 个文件`);
    
    if (files.length > 0) {
      files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
      });
    }
    
    // 5. 检查存储桶策略
    console.log('\n🛡️ 检查存储桶策略...');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'new-images');
    
    if (policiesError) {
      console.error('❌ 获取策略失败:', policiesError);
    } else {
      console.log('✅ 策略获取成功');
      console.log(`📋 找到 ${policies?.length || 0} 个策略`);
      
      policies?.forEach((policy, index) => {
        console.log(`  ${index + 1}. ${policy.name} (${policy.command})`);
        console.log(`     角色: ${policy.roles || '无限制'}`);
      });
      
      if (!policies || policies.length === 0) {
        console.warn('⚠️ 未找到任何策略，需要设置访问策略');
      }
    }
    
    // 6. 测试文件上传权限
    console.log('\n📤 测试文件上传权限...');
    await testFileUpload();
    
    console.log('\n🎉 诊断完成');
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
  }
};

/**
 * 测试文件上传权限
 */
const testFileUpload = async (): Promise<void> => {
  try {
    // 创建一个小的测试图片
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('❌ 无法创建测试图片');
      return;
    }
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, 50, 50);
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(new Blob(['test'], { type: 'text/plain' }));
        }
      }, 'image/png');
    });
    
    const testFile = new File([blob], `debug-test-${Date.now()}.png`, { type: 'image/png' });
    const testFileName = `debug-test-${Date.now()}.png`;
    
    console.log('📤 上传测试文件...');
    
    const { data, error } = await supabase.storage
      .from('new-images')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('❌ 测试上传失败:', error);
      console.error('错误代码:', error.message);
      
      // 分析常见错误
      if (error.message.includes('Permission denied') || error.message.includes('policy')) {
        console.log('💡 可能原因: 缺少上传策略');
        console.log('💡 解决方案: 执行设置存储桶策略的SQL语句');
      } else if (error.message.includes('Bucket not found')) {
        console.log('💡 可能原因: 存储桶不存在');
        console.log('💡 解决方案: 执行创建存储桶的SQL语句');
      }
      
    } else {
      console.log('✅ 测试上传成功');
      console.log('📄 文件路径:', data.path);
      
      // 测试公共URL访问
      const { data: { publicUrl } } = supabase.storage
        .from('new-images')
        .getPublicUrl(testFileName);
      
      console.log('🌐 公共URL:', publicUrl);
      
      // 清理测试文件
      await supabase.storage.from('new-images').remove([testFileName]);
      console.log('🧹 测试文件已清理');
    }
    
  } catch (error) {
    console.error('❌ 测试上传时发生错误:', error);
  }
};

/**
 * 快速修复建议
 */
export const getFixSuggestions = (): string[] => {
  return [
    '1. 确认已创建 new-images 存储桶',
    '2. 执行存储桶策略设置SQL语句',
    '3. 检查用户权限（需要登录才能上传）',
    '4. 确认环境变量配置正确',
    '5. 检查网络连接和防火墙设置'
  ];
};

// 在开发环境中暴露到全局
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).debugSupabaseStorage = debugStorageAccess;
  (window as any).getStorageFixSuggestions = getFixSuggestions;
  console.log('💡 在控制台运行 debugSupabaseStorage() 来诊断存储问题');
  console.log('💡 运行 getStorageFixSuggestions() 获取修复建议');
}