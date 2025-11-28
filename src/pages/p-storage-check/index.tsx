import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BucketInfo {
  name: string;
  public: boolean;
  file_size_limit?: number;
  created_at?: string;
}

const StorageCheckPage: React.FC = () => {
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    setLoading(true);
    setError('');

    try {
      // 检查存储桶列表
      const { data: bucketList, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        setError(`获取存储桶列表失败: ${listError.message}`);
        return;
      }

      setBuckets(bucketList || []);

      // 检查必需的存储桶
      const requiredBuckets = ['achievement-images', 'achievement-videos'];
      const bucketNames = bucketList?.map(b => b.name) || [];
      
      const missingBuckets = requiredBuckets.filter(name => !bucketNames.includes(name));
      
      if (missingBuckets.length > 0) {
        setError(`缺少必需的存储桶: ${missingBuckets.join(', ')}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '检查存储时发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    try {
      // 创建一个测试文件
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // 测试上传到 achievement-images
      const { error: uploadError } = await supabase.storage
        .from('achievement-images')
        .upload('test/test.txt', testFile);

      if (uploadError) {
        alert(`上传测试失败: ${uploadError.message}`);
      } else {
        alert('上传测试成功！');
        // 清理测试文件
        await supabase.storage.from('achievement-images').remove(['test/test.txt']);
      }
    } catch (err) {
      alert(`测试失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '未知';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">存储系统检查</h1>
        
        {/* 检查按钮 */}
        <div className="mb-6">
          <button
            onClick={checkStorage}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '检查中...' : '重新检查'}
          </button>
          
          {buckets.length > 0 && (
            <button
              onClick={testUpload}
              className="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              测试上传
            </button>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">错误</h3>
            <p className="text-red-600 whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* 存储桶列表 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">存储桶列表</h2>
          </div>
          
          {buckets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {loading ? '检查中...' : '未找到任何存储桶'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {buckets.map((bucket) => (
                <div key={bucket.name} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{bucket.name}</h3>
                      <p className="text-sm text-gray-500">
                        公开访问: {bucket.public ? '是' : '否'}
                      </p>
                      <p className="text-sm text-gray-500">
                        文件大小限制: {formatFileSize(bucket.file_size_limit)}
                      </p>
                      {bucket.created_at && (
                        <p className="text-sm text-gray-500">
                          创建时间: {new Date(bucket.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {bucket.name.includes('achievement') && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          成果相关
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 解决方案 */}
        {error && error.includes('缺少必需的存储桶') && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-800 font-semibold mb-4">解决方案</h3>
            <p className="text-blue-700 mb-4">请按照以下步骤创建缺少的存储桶：</p>
            
            <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">方法一：在 Supabase 控制台手动创建</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>登录 Supabase 控制台</li>
                <li>选择您的项目</li>
                <li>进入 Storage 部分</li>
                <li>点击 "New bucket" 创建新存储桶</li>
                <li>创建以下存储桶：<br/>
                  - <code>achievement-images</code> (公开访问，文件大小限制: 5MB)<br/>
                  - <code>achievement-videos</code> (公开访问，文件大小限制: 200MB)
                </li>
                <li>为每个存储桶设置相应的文件类型限制</li>
              </ol>
            </div>
            
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <h4 className="font-semibold mb-2">方法二：使用 SQL 创建</h4>
              <p className="text-sm mb-2">在 Supabase 控制台的 SQL 编辑器中运行：</p>
              <p className="text-xs text-gray-300">参考项目根目录的 create-storage-buckets.sql 文件</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageCheckPage;