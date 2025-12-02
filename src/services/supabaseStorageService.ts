import { supabase } from '../lib/supabase';

export interface StorageFile {
  name: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  size?: number;
  etag?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// =====================================
// new-images 存储桶相关功能
// =====================================

/**
 * 创建new-images存储桶
 */
export const createNewImagesBucket = async (): Promise<boolean> => {
  try {
    // 检查桶是否已存在
    const { data: buckets } = await supabase.storage.listBuckets();
    const newImagesBucket = buckets?.find(bucket => bucket.name === 'new-images');
    
    if (newImagesBucket) {
      console.log('new-images存储桶已存在');
      return true;
    }

    // 创建新桶
    const { error } = await supabase.storage.createBucket('new-images', {
      public: true, // 设置为公开访问
      allowedMimeTypes: ['image/*'], // 只允许上传图片
      fileSizeLimit: 5 * 1024 * 1024, // 限制文件大小为5MB
    });

    if (error) {
      console.error('创建new-images存储桶失败:', error);
      return false;
    }

    console.log('new-images存储桶创建成功');
    return true;
  } catch (error) {
    console.error('创建存储桶时发生错误:', error);
    return false;
  }
};

/**
 * 上传图片到new-images桶
 * @param file 要上传的文件
 * @param fileName 文件名（可选，默认使用时间戳+原文件名）
 * @returns 上传结果对象
 */
export const uploadToNewImagesBucket = async (file: File, fileName?: string): Promise<UploadResult> => {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '只能上传图片文件' };
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: '图片大小不能超过5MB' };
    }

    // 确保桶存在
    const bucketExists = await createNewImagesBucket();
    if (!bucketExists) {
      return { success: false, error: '无法创建或访问new-images存储桶' };
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = fileName || `${timestamp}_${randomString}_${file.name}`;
    
    // 上传文件
    const { error } = await supabase.storage
      .from('new-images')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false, // 不允许覆盖，避免文件名冲突
      });

    if (error) {
      console.error('上传到new-images桶失败:', error);
      
      if (error.message.includes('duplicate')) {
        return { success: false, error: '文件名已存在，请重试' };
      }
      
      return { success: false, error: `上传失败: ${error.message}` };
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('new-images')
      .getPublicUrl(finalFileName);

    console.log('图片上传到new-images桶成功:', publicUrl);
    
    return { 
      success: true, 
      url: publicUrl,
      error: undefined
    };
  } catch (error) {
    console.error('上传到new-images桶时发生错误:', error);
    return { success: false, error: '上传过程中发生未知错误' };
  }
};

/**
 * 删除new-images桶中的图片
 * @param fileName 文件名或URL
 */
export const deleteFromNewImagesBucket = async (fileName: string): Promise<boolean> => {
  try {
    // 如果传入的是完整URL，提取文件名
    const extractedFileName = fileName.split('/').pop() || fileName;
    
    const { error } = await supabase.storage
      .from('new-images')
      .remove([extractedFileName]);

    if (error) {
      console.error('从new-images桶删除图片失败:', error);
      return false;
    }

    console.log('从new-images桶删除图片成功');
    return true;
  } catch (error) {
    console.error('从new-images桶删除图片时发生错误:', error);
    return false;
  }
};

/**
 * 列出new-images桶中的所有文件
 */
export const listNewImages = async (): Promise<StorageFile[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('new-images')
      .list();

    if (error) {
      console.error('列出new-images桶图片失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('列出new-images桶图片时发生错误:', error);
    return [];
  }
};

/**
 * 获取new-images桶的公共URL
 * @param fileName 文件名
 * @returns 公共URL
 */
export const getNewImagesUrl = (fileName: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('new-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};

/**
 * 检查new-images桶是否存在
 */
export const checkNewImagesBucket = async (): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.some(bucket => bucket.name === 'new-images') || false;
  } catch (error) {
    console.error('检查new-images存储桶时发生错误:', error);
    return false;
  }
};

// =====================================
// 兼容性：保留原有的news-images功能
// =====================================



/**
 * 上传图片（保留兼容性，默认使用new-images）
 */
export const uploadNewsImage = uploadToNewImagesBucket;

/**
 * 删除图片（保留兼容性）
 */
export const deleteNewsImage = deleteFromNewImagesBucket;





// =====================================
// news-images 存储桶相关功能（用于新闻管理）
// =====================================

/**
 * 检查news-images存储桶是否存在
 */
export const checkNewsImagesBucket = async (): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.some(bucket => bucket.name === 'news-images') || false;
  } catch (error) {
    console.error('检查news-images存储桶时发生错误:', error);
    return false;
  }
};

/**
 * 压缩图片（优化上传速度）
 * @param file 原始文件
 * @param maxWidth 最大宽度
 * @param quality 压缩质量 0-1
 * @returns 压缩后的文件
 */
const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      
      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // 压缩失败返回原文件
        }
      }, file.type, quality);
    };
    
    img.onerror = () => resolve(file); // 加载失败返回原文件
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 上传图片到news-images桶（用于新闻管理）- 优化版本
 * @param file 要上传的文件
 * @param fileName 文件名（可选，默认使用时间戳+原文件名）
 * @returns 上传结果对象
 */
export const uploadToNewsImagesBucket = async (file: File, fileName?: string): Promise<UploadResult> => {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '只能上传图片文件' };
    }

    // 验证文件大小（10MB，但会自动压缩）
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: '图片大小不能超过10MB' };
    }

    console.log('开始处理图片:', file.name, `原始大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // 自动压缩大图片
    let fileToUpload = file;
    if (file.size > 1024 * 1024) { // 大于1MB的图片进行压缩
      console.log('正在压缩图片...');
      fileToUpload = await compressImage(file, 1200, 0.8);
      console.log(`压缩完成，新大小: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = fileName || `${timestamp}_${randomString}_${fileToUpload.name}`;
    
    console.log('开始上传到news-images桶:', finalFileName);
    
    // 上传文件到news-images桶
    const startTime = Date.now();
    const { error } = await supabase.storage
      .from('news-images')
      .upload(finalFileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false, // 不允许覆盖，避免文件名冲突
      });

    const uploadTime = Date.now() - startTime;
    console.log(`上传耗时: ${uploadTime}ms`);

    if (error) {
      console.error('上传到news-images桶失败:', error);
      
      if (error.message.includes('duplicate')) {
        return { success: false, error: '文件名已存在，请重试' };
      }
      
      return { success: false, error: `上传失败: ${error.message}` };
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('news-images')
      .getPublicUrl(finalFileName);

    console.log('图片上传到news-images桶成功:', publicUrl);
    console.log(`总处理时间: ${Date.now() - startTime}ms`);
    
    return { 
      success: true, 
      url: publicUrl,
      error: undefined
    };
  } catch (error) {
    console.error('上传到news-images桶时发生错误:', error);
    return { success: false, error: '上传过程中发生未知错误' };
  }
};

/**
 * 删除news-images桶中的图片
 * @param fileName 文件名或URL
 */
export const deleteFromNewsImagesBucket = async (fileName: string): Promise<boolean> => {
  try {
    // 如果传入的是完整URL，提取文件名
    const extractedFileName = fileName.split('/').pop() || fileName;
    
    console.log('从news-images桶删除图片:', extractedFileName);
    
    const { error } = await supabase.storage
      .from('news-images')
      .remove([extractedFileName]);

    if (error) {
      console.error('从news-images桶删除图片失败:', error);
      return false;
    }

    console.log('从news-images桶删除图片成功');
    return true;
  } catch (error) {
    console.error('从news-images桶删除图片时发生错误:', error);
    return false;
  }
};

/**
 * 列出news-images桶中的所有文件
 */
export const listNewsImages = async (): Promise<StorageFile[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('news-images')
      .list();

    if (error) {
      console.error('列出news-images桶图片失败:', error);
      return [];
    }

    console.log('news-images桶中的文件:', data);
    return data || [];
  } catch (error) {
    console.error('列出news-images桶图片时发生错误:', error);
    return [];
  }
};

/**
 * 获取news-images桶的公共URL
 * @param fileName 文件名
 * @returns 公共URL
 */
export const getNewsImageUrl = (fileName: string): string => {
  const { data: { publicUrl } } = supabase.storage
    .from('news-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
};

/**
 * 创建news-images存储桶（保留兼容性）
 */
export const createNewsImagesBucket = async (): Promise<boolean> => {
  try {
    // 检查桶是否已存在
    const { data: buckets } = await supabase.storage.listBuckets();
    const newsImagesBucket = buckets?.find(bucket => bucket.name === 'news-images');
    
    if (newsImagesBucket) {
      console.log('news-images存储桶已存在');
      return true;
    }

    // 创建新桶
    const { error } = await supabase.storage.createBucket('news-images', {
      public: true, // 设置为公开访问
      allowedMimeTypes: ['image/*'], // 只允许上传图片
      fileSizeLimit: 5 * 1024 * 1024, // 限制文件大小为5MB
    });

    if (error) {
      console.error('创建news-images存储桶失败:', error);
      return false;
    }

    console.log('news-images存储桶创建成功');
    return true;
  } catch (error) {
    console.error('创建存储桶时发生错误:', error);
    return false;
  }
};