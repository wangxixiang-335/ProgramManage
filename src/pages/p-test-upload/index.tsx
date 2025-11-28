import React, { useState } from 'react';
import { AchievementService } from '../../lib/supabase';

const TestUploadPage: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      setResult('开始上传...');

      try {
        const fileName = `test_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `test/${fileName}`;
        
        console.log('测试图片上传...');
        const uploadResult = await AchievementService.uploadFile(file, 'achievement-images', filePath);
        
        if (uploadResult.success) {
          setResult(`✅ 图片上传成功！\nURL: ${uploadResult.url}`);
          console.log('上传成功，URL:', uploadResult.url);
        } else {
          setResult(`❌ 图片上传失败：\n${uploadResult.message}`);
          console.error('上传失败:', uploadResult.message);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setResult(`❌ 上传异常：${errorMsg}`);
        console.error('上传异常:', error);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const testVideoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      setResult('开始上传...');

      try {
        const fileName = `test_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `test/${fileName}`;
        
        console.log('测试视频上传...');
        const uploadResult = await AchievementService.uploadFile(file, 'achievement-videos', filePath);
        
        if (uploadResult.success) {
          setResult(`✅ 视频上传成功！\nURL: ${uploadResult.url}`);
          console.log('上传成功，URL:', uploadResult.url);
        } else {
          setResult(`❌ 视频上传失败：\n${uploadResult.message}`);
          console.error('上传失败:', uploadResult.message);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setResult(`❌ 上传异常：${errorMsg}`);
        console.error('上传异常:', error);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const checkBuckets = async () => {
    setResult('检查存储桶中...');
    try {
      const response = await fetch('/api/check-buckets');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`检查失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">文件上传测试</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testImageUpload}
            disabled={uploading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? '上传中...' : '测试图片上传 (achievement-images)'}
          </button>
          
          <button
            onClick={testVideoUpload}
            disabled={uploading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? '上传中...' : '测试视频上传 (achievement-videos)'}
          </button>
          
          <button
            onClick={checkBuckets}
            disabled={uploading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            检查存储桶状态
          </button>
        </div>

        {result && (
          <div className="p-4 bg-gray-800 text-white rounded-lg">
            <h3 className="font-semibold mb-2">测试结果：</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">使用说明：</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 点击按钮测试不同类型的文件上传</li>
            <li>• 查看浏览器控制台的详细日志</li>
            <li>• 如果上传失败，请检查 Supabase 控制台中的存储桶设置</li>
            <li>• 确保已运行 quick-create-buckets.sql 中的 SQL 语句</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestUploadPage;