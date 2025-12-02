import React, { useState } from 'react';
import ImageUpload from '../../components/ImageUpload';

const ImageUploadExample: React.FC = () => {
  React.useEffect(() => {
    document.title = '图片上传组件示例';
  }, []);

  const [singleImage, setSingleImage] = useState<string>('');
  const [multiImages, setMultiImages] = useState<string[]>([]);
  const [formImage, setFormImage] = useState<string>('');

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('表单数据:', {
      singleImage,
      formImage,
      multiImages
    });
    alert('请查看控制台输出');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">🖼️ 图片上传组件使用示例</h1>
          
          {/* 基本用法 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">1. 基本用法</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  单张图片上传
                </label>
                <ImageUpload
                  value={singleImage}
                  onChange={setSingleImage}
                  placeholder="上传单张图片"
                />
              </div>
            </div>
          </div>

          {/* 表单中使用 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">2. 表单中使用</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品图片 <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  value={formImage}
                  onChange={setFormImage}
                  required
                  placeholder="请上传商品图片"
                  className="border border-gray-300 rounded-lg p-4 bg-gray-50"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!formImage}
                >
                  提交表单
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormImage('');
                    setSingleImage('');
                    setMultiImages([]);
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  重置所有
                </button>
              </div>
            </form>
          </div>

          {/* 不同配置 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">3. 不同配置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  禁用状态（带预设图片）
                </label>
                <ImageUpload
                  value="https://picsum.photos/400/300"
                  onChange={() => {}}
                  disabled
                  placeholder="禁用状态"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  大文件限制（1MB）
                </label>
                <ImageUpload
                  value={undefined}
                  onChange={undefined}
                  maxSize={1}
                  placeholder="最大1MB文件"
                />
              </div>
            </div>
          </div>

          {/* 当前状态 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">4. 当前上传状态</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div><strong>单张图片:</strong> {singleImage || '未上传'}</div>
                <div><strong>表单图片:</strong> {formImage || '未上传'}</div>
                <div><strong>多张图片:</strong> {multiImages.length} 张</div>
              </div>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-yellow-800">📋 组件属性说明</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">value</code> - 当前图片URL</li>
              <li><code className="bg-gray-100 px-1 rounded">onChange</code> - 图片变化回调</li>
              <li><code className="bg-gray-100 px-1 rounded">disabled</code> - 是否禁用</li>
              <li><code className="bg-gray-100 px-1 rounded">maxSize</code> - 最大文件大小(MB)</li>
              <li><code className="bg-gray-100 px-1 rounded">required</code> - 是否必填</li>
              <li><code className="bg-gray-100 px-1 rounded">placeholder</code> - 提示文本</li>
              <li><code className="bg-gray-100 px-1 rounded">className</code> - 自定义样式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadExample;