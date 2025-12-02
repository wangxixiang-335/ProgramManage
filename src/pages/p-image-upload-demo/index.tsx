import React from 'react';
import ImageUploadDemo from '../../components/ImageUploadDemo';

const ImageUploadDemoPage: React.FC = () => {
  React.useEffect(() => {
    document.title = '图片上传演示 - new-images 存储桶';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <ImageUploadDemo />
      </div>
    </div>
  );
};

export default ImageUploadDemoPage;