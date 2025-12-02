import React, { useState } from 'react';
import { 
  uploadToNewImagesBucket, 
  deleteFromNewImagesBucket,
  type UploadResult
} from '../services/supabaseStorageService';

export interface ImageUploadProps {
  /** 当前图片URL */
  value?: string;
  /** 图片上传成功后的回调 */
  onChange?: (url: string | undefined) => void;
  /** 是否禁用上传 */
  disabled?: boolean;
  /** 是否显示删除按钮 */
  showDelete?: boolean;
  /** 最大文件大小（MB），默认5MB */
  maxSize?: number;
  /** 接受的文件类型，默认所有图片类型 */
  accept?: string;
  /** 占位文本 */
  placeholder?: string;
  /** 样式类名 */
  className?: string;
  /** 是否必填 */
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  showDelete = true,
  maxSize = 5,
  accept = "image/*",
  placeholder = "点击上传图片",
  className = "",
  required = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      // 验证文件大小
      if (file.size > maxSize * 1024 * 1024) {
        setError(`文件大小不能超过${maxSize}MB`);
        return;
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError('只能上传图片文件');
        return;
      }

      // 上传文件
      const result: UploadResult = await uploadToNewImagesBucket(file);
      
      if (result.success && result.url) {
        onChange?.(result.url);
        console.log('图片上传成功:', result.url);
      } else {
        setError(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      setError('上传过程中发生错误');
    } finally {
      setUploading(false);
      // 清空文件输入
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // 删除图片
  const handleDelete = async () => {
    if (!value) return;

    try {
      const success = await deleteFromNewImagesBucket(value);
      if (success) {
        onChange?.(undefined);
        setError('');
      } else {
        setError('删除失败');
      }
    } catch (error) {
      console.error('删除错误:', error);
      setError('删除过程中发生错误');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 当前图片预览 */}
      {value && (
        <div className="relative inline-block border border-gray-300 rounded-lg overflow-hidden">
          <img 
            src={value} 
            alt="上传的图片"
            className="max-w-full h-32 object-cover"
          />
          {showDelete && !disabled && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center shadow-lg"
              title="删除图片"
            >
              ×
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={() => window.open(value, '_blank')}
              className="absolute top-2 left-2 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center shadow-lg"
              title="查看原图"
            >
              🔍
            </button>
          )}
        </div>
      )}

      {/* 上传控件 */}
      {!value && !disabled && (
        <div className="relative">
          <input
            type="file"
            onChange={handleFileChange}
            accept={accept}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            required={required}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
            {uploading ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>上传中...</span>
              </div>
            ) : (
              <div className="text-gray-600">
                <div className="text-2xl mb-2">📷</div>
                <div className="text-sm">{placeholder}</div>
                <div className="text-xs text-gray-400 mt-1">
                  支持 JPG、PNG、GIF、WebP 格式，最大 {maxSize}MB
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* 图片信息 */}
      {value && !disabled && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          <div className="font-semibold">图片信息：</div>
          <div>URL: {value}</div>
          <div>文件名: {value.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;