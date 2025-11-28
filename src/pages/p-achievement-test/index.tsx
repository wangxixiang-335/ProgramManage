import React, { useState } from 'react';
import { AchievementService } from '../../lib/achievementService';

const UploadTestPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testImageUpload = async () => {
    setIsUploading(true);
    addResult('🖼️ 开始测试图片上传...');

    try {
      // 创建一个测试图片文件
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('测试图片', 80, 100);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
          const fileName = `test_${Date.now()}.png`;
          const filePath = `test/${fileName}`;
          
          addResult(`📁 文件信息: ${fileName} (${(testFile.size / 1024).toFixed(2)}KB)`);
          
          const result = await AchievementService.uploadFile(testFile, 'achievement-images', filePath);
          
          if (result.success) {
            addResult(`✅ 图片上传成功！`);
            addResult(`🔗 URL: ${result.url}`);
            
            // 创建一个img标签来测试URL是否可访问
            const img = new Image();
            img.onload = () => addResult(`✅ 图片URL验证成功！`);
            img.onerror = () => addResult(`❌ 图片URL验证失败！`);
            img.src = result.url!;
          } else {
            addResult(`❌ 图片上传失败！`);
            addResult(`错误信息: ${result.message}`);
          }
        }
      }, 'image/png');
    } catch (error) {
      addResult(`❌ 测试过程中发生错误: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const testVideoUpload = async () => {
    setIsUploading(true);
    addResult('🎥 开始测试视频上传...');

    try {
      // 创建一个测试视频文件（这里用一个小的Blob模拟）
      const testBlob = new Blob(['test video content'], { type: 'video/mp4' });
      const testFile = new File([testBlob], 'test-video.mp4', { type: 'video/mp4' });
      const fileName = `test_${Date.now()}.mp4`;
      const filePath = `test/${fileName}`;
      
      addResult(`📁 文件信息: ${fileName} (${(testFile.size / 1024).toFixed(2)}KB)`);
      
      const result = await AchievementService.uploadFile(testFile, 'achievement-videos', filePath);
      
      if (result.success) {
        addResult(`✅ 视频上传成功！`);
        addResult(`🔗 URL: ${result.url}`);
      } else {
        addResult(`❌ 视频上传失败！`);
        addResult(`错误信息: ${result.message}`);
      }
    } catch (error) {
      addResult(`❌ 测试过程中发生错误: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const testRichTextImageProcessing = async () => {
    setIsUploading(true);
    addResult('📝 开始测试富文本图片处理...');

    try {
      // 创建包含base64图片的HTML
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(0, 0, 200, 150);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('富文本测试', 50, 75);
      }

      const base64Image = canvas.toDataURL('image/png');
      const testHtml = `
        <div>
          <p>这是一个测试段落</p>
          <img src="${base64Image}" alt="测试图片" />
          <p>图片之后的段落</p>
        </div>
      `;

      addResult(`📝 准备处理包含base64图片的HTML...`);

      const result = await AchievementService.processRichTextImages(testHtml, 'test-user-id');

      if (result.success) {
        addResult(`✅ 富文本图片处理成功！`);
        addResult(`📄 处理后的HTML长度: ${result.processedContent?.length || 0} 字符`);
        
        // 检查是否还有base64图片
        if (result.processedContent && !result.processedContent.includes('data:image')) {
          addResult(`✅ 所有base64图片已成功转换为Storage URL`);
        } else {
          addResult(`⚠️ 仍包含base64图片，可能处理未完全成功`);
        }
      } else {
        addResult(`❌ 富文本图片处理失败！`);
        addResult(`错误信息: ${result.message}`);
      }
    } catch (error) {
      addResult(`❌ 测试过程中发生错误: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 文件上传功能测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">测试选项</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testImageUpload}
              disabled={isUploading}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🖼️ 测试图片上传
            </button>
            
            <button
              onClick={testVideoUpload}
              disabled={isUploading}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🎥 测试视频上传
            </button>
            
            <button
              onClick={testRichTextImageProcessing}
              disabled={isUploading}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📝 测试富文本图片
            </button>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🗑️ 清空结果
            </button>
            
            {isUploading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                正在测试...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">测试结果</h2>
          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">点击上方按钮开始测试...</p>
            ) : (
              <div className="space-y-2 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="p-2 border-b border-gray-200 last:border-b-0">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 测试说明</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 确保已运行 <code className="bg-yellow-100 px-1 rounded">fix-storage-policies.sql</code> 设置正确的权限</li>
            <li>• 确保存储桶 <code className="bg-yellow-100 px-1 rounded">achievement-images</code> 和 <code className="bg-yellow-100 px-1 rounded">achievement-videos</code> 已创建</li>
            <li>• 如果测试失败，请检查浏览器控制台的详细错误信息</li>
            <li>• 测试图片会创建一个简单的300x200像素的测试图片</li>
            <li>• 测试视频会创建一个小的模拟视频文件用于验证上传流程</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadTestPage;