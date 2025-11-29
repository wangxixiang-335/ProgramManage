// Supabase Storage 设置脚本
// 需要使用服务端密钥运行，而不是客户端密钥

import { createClient } from '@supabase/supabase-js';

// 使用服务端密钥（需要从Supabase项目设置中获取）
const supabaseUrl = 'https://vntvrdkjtfdcnvwgrubo.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // 需要替换为实际的服务端密钥

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('Setting up Supabase Storage buckets...');

    // 1. 创建 achievement-images 存储桶
    const { data: imagesBucket, error: imagesError } = await supabase.storage
      .createBucket('achievement-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880, // 5MB
      });

    if (imagesError) {
      if (imagesError.message.includes('already exists')) {
        console.log('✅ achievement-images bucket already exists');
      } else {
        console.error('❌ Failed to create achievement-images bucket:', imagesError.message);
      }
    } else {
      console.log('✅ Created achievement-images bucket');
    }

    // 2. 创建 achievement-videos 存储桶
    const { data: videosBucket, error: videosError } = await supabase.storage
      .createBucket('achievement-videos', {
        public: true,
        allowedMimeTypes: ['video/*'],
        fileSizeLimit: 209715200, // 200MB
      });

    if (videosError) {
      if (videosError.message.includes('already exists')) {
        console.log('✅ achievement-videos bucket already exists');
      } else {
        console.error('❌ Failed to create achievement-videos bucket:', videosError.message);
      }
    } else {
      console.log('✅ Created achievement-videos bucket');
    }

    // 3. 设置存储桶权限策略（公共读取）
    const storagePolicies = [
      {
        bucket: 'achievement-images',
        name: 'Public Access',
        definition: {
          select: true,
          insert: true,
          update: true,
          delete: false
        }
      },
      {
        bucket: 'achievement-videos', 
        name: 'Public Access',
        definition: {
          select: true,
          insert: true,
          update: true,
          delete: false
        }
      }
    ];

    for (const policy of storagePolicies) {
      // 这里需要使用SQL语句设置RLS策略
      console.log(`Setting up policies for ${policy.bucket}...`);
    }

    console.log('\n🎉 Storage setup completed!');
    console.log('\n⚠️  注意事项:');
    console.log('1. 请在Supabase控制台中验证存储桶是否创建成功');
    console.log('2. 设置适当的RLS（Row Level Security）策略');
    console.log('3. 确保存储桶设置为公共访问');
    console.log('4. 检查文件大小限制是否符合需求');

  } catch (error) {
    console.error('Storage setup failed:', error);
  }
}

// 生成创建存储桶的SQL语句
function generateBucketCreationSQL() {
  return `
-- 创建 achievement-images 存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-images', 
  'achievement-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 创建 achievement-videos 存储桶  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-videos',
  'achievement-videos', 
  true,
  209715200, -- 200MB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 为 achievement-images 设置公共访问策略
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-images');

CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images" ON storage.objects  
FOR UPDATE USING (
  bucket_id = 'achievement-images'
  AND auth.role() = 'authenticated'
);

-- 为 achievement-videos 设置公共访问策略
CREATE POLICY "Public videos are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-videos');

CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'  
);

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'
);
  `;
}

console.log('SQL语句用于在Supabase控制台中手动创建存储桶和设置策略:');
console.log(generateBucketCreationSQL());

if (process.argv.includes('--run')) {
  setupStorage();
} else {
  console.log('\n使用 --run 参数来执行存储桶创建（需要服务端密钥）');
  console.log('或者将上面的SQL复制到Supabase控制台的SQL编辑器中执行');
}