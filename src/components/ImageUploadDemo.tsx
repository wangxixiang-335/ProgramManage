import React, { useState } from 'react';
import { 
  uploadToNewImagesBucket, 
  deleteFromNewImagesBucket,
  listNewImages,
  checkNewImagesBucket,
  type UploadResult
} from '../services/supabaseStorageService';

const ImageUploadDemo: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<string>('检查中...');

  // 检查存储桶状态
  const checkBucket = async () => {
    const exists = await checkNewImagesBucket();
    setBucketStatus(exists ? '✅ new-images存储桶已存在' : '❌ new-images存储桶不存在');
  };

  React.useEffect(() => {
    checkBucket();
  }, []);

  // 处理图片上传
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('上传中...');

    try {
      const result: UploadResult = await uploadToNewImagesBucket(file);
      
      if (result.success && result.url) {
        setUploadedImages(prev => [...prev, result.url!]);
        setUploadStatus(`✅ 上传成功: ${file.name}`);
      } else {
        setUploadStatus(`❌ 上传失败: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus(`❌ 上传错误: ${error}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // 清空文件输入
    }
  };

  // 删除图片
  const handleDelete = async (imageUrl: string, index: number) => {
    try {
      const success = await deleteFromNewImagesBucket(imageUrl);
      if (success) {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
        setUploadStatus('✅ 删除成功');
      } else {
        setUploadStatus('❌ 删除失败');
      }
    } catch (error) {
      setUploadStatus(`❌ 删除错误: ${error}`);
    }
  };

  // 列出所有图片
  const listAllImages = async () => {
    try {
      const images = await listNewImages();
      console.log('new-images桶中的所有图片:', images);
      setUploadStatus(`📁 找到 ${images.length} 个文件`);
    } catch (error) {
      setUploadStatus(`❌ 列表获取失败: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">
        🖼️ new-images 存储桶演示
      </h2>
      
      {/* 存储桶状态 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">存储桶状态</h3>
        <p className="text-sm text-gray-600">{bucketStatus}</p>
        <button 
          onClick={checkBucket}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重新检查
        </button>
      </div>

      {/* 上传区域 */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="font-semibold mb-2">上传图片到 new-images 桶</h3>
        <input 
          type="file"
          onChange={handleUpload}
          accept="image/*"
          disabled={isUploading}
          className="mb-2"
        />
        <button 
          onClick={listAllImages}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          列出所有文件
        </button>
        {isUploading && <span className="ml-2 text-blue-600">上传中...</span>}
      </div>

      {/* 状态显示 */}
      {uploadStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold mb-1">状态</h3>
          <p className="text-sm">{uploadStatus}</p>
        </div>
      )}

      {/* 已上传图片展示 */}
      {uploadedImages.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">已上传的图片</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative border rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`上传图片 ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button 
                    onClick={() => window.open(imageUrl, '_blank')}
                    className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={() => handleDelete(imageUrl, index)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
                <div className="p-2 text-xs text-gray-600 truncate">
                  {imageUrl.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">📋 使用说明</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>支持 JPG、PNG、GIF、WebP 格式</li>
          <li>文件大小限制：5MB</li>
          <li>上传成功后会自动生成公共访问URL</li>
          <li>图片存储在 Supabase Storage 的 new-images 桶中</li>
          <li>URL格式：`/storage/v1/object/public/new-images/filename.jpg`</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadDemo;