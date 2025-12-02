-- =====================================================
-- new-images 存储桶权限配置脚本
-- 在 Supabase SQL 编辑器中执行这些SQL语句
-- =====================================================

-- 1. 首先确保存储桶存在（如果不存在则创建）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'new-images', 
  'new-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 设置公共访问策略 - 允许任何人查看图片
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'new-images');

-- 3. 设置上传策略 - 允许已认证用户上传图片
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'new-images' AND 
  auth.role() = 'authenticated'
);

-- 4. 设置更新策略 - 允许已认证用户更新自己的图片
CREATE POLICY "Authenticated users can update own images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'new-images' AND 
  auth.role() = 'authenticated'
);

-- 5. 设置删除策略 - 允许已认证用户删除自己的图片
CREATE POLICY "Authenticated users can delete own images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'new-images' AND 
  auth.role() = 'authenticated'
);

-- 6. 允许匿名用户上传（可选，如果不需要请注释掉）
-- CREATE POLICY "Allow anonymous uploads" ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'new-images'
-- );

-- =====================================================
-- 验证配置的查询语句
-- =====================================================

-- 检查存储桶是否存在
SELECT * FROM storage.buckets WHERE id = 'new-images';

-- 检查策略是否创建成功
SELECT * FROM storage.policies WHERE bucket_id = 'new-images';

-- =====================================================
-- 故障排除说明
-- =====================================================

-- 如果执行时遇到权限问题，请确保：
-- 1. 你使用的是项目所有者账户登录
-- 2. 在 Supabase Dashboard > SQL Editor 中执行
-- 3. 如果某些策略已存在，可以先删除后重新创建：
--    DROP POLICY "Policy Name" ON storage.objects;

-- 如果仍然无法上传，请检查：
-- 1. 用户是否已登录（auth.uid() 不为空）
-- 2. 文件类型是否在 allowed_mime_types 中
-- 3. 文件大小是否超过 file_size_limit
-- 4. CORS 设置是否正确（在 Dashboard > Settings > API 中配置）