-- 快速创建存储桶 - 复制这段代码到 Supabase 控制台的 SQL 编辑器中运行

-- 创建图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-images',
  'achievement-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 创建视频存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievement-videos',
  'achievement-videos',
  true,
  209715200,
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

-- 为图片存储桶设置策略
DROP POLICY IF EXISTS "Public achievement images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own achievement images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own achievement images" ON storage.objects;

CREATE POLICY "Public achievement images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-images');

CREATE POLICY "Users can upload their own achievement images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own achievement images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'achievement-images'
  AND auth.role() = 'authenticated'
);

-- 为视频存储桶设置策略
DROP POLICY IF EXISTS "Public achievement videos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own achievement videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own achievement videos" ON storage.objects;

CREATE POLICY "Public achievement videos are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-videos');

CREATE POLICY "Users can upload their own achievement videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own achievement videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'
);