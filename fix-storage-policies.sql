-- 优化的存储桶策略 - 修复上传权限问题
-- 复制这段代码到 Supabase 控制台的 SQL 编辑器中运行

-- 首先删除所有现有策略
DROP POLICY IF EXISTS "Public achievement images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own achievement images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own achievement images" ON storage.objects;
DROP POLICY IF EXISTS "Public achievement videos are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own achievement videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own achievement videos" ON storage.objects;

-- 为图片存储桶设置新的宽松策略
CREATE POLICY "Enable read access for all users on achievement images" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-images');

CREATE POLICY "Enable insert access for all users on achievement images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'achievement-images');

CREATE POLICY "Enable update access for all users on achievement images" ON storage.objects
FOR UPDATE USING (bucket_id = 'achievement-images');

CREATE POLICY "Enable delete access for all users on achievement images" ON storage.objects
FOR DELETE USING (bucket_id = 'achievement-images');

-- 为视频存储桶设置新的宽松策略
CREATE POLICY "Enable read access for all users on achievement videos" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-videos');

CREATE POLICY "Enable insert access for all users on achievement videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'achievement-videos');

CREATE POLICY "Enable update access for all users on achievement videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'achievement-videos');

CREATE POLICY "Enable delete access for all users on achievement videos" ON storage.objects
FOR DELETE USING (bucket_id = 'achievement-videos');

-- 确保存储桶是公开的
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('achievement-images', 'achievement-videos');