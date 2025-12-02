-- =====================================
-- 修复 news-images 存储桶访问问题
-- 在 Supabase SQL 编辑器中执行以下语句
-- =====================================

-- 1. 首先删除所有可能冲突的现有策略
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Full Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;

-- 2. 确保存储桶存在（如果不存在则创建）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. 设置正确的访问策略

-- 公开读取策略 - 允许任何人读取存储桶中的文件
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'news-images');

-- 认证用户上传策略 - 允许已登录用户上传文件
CREATE POLICY "Authenticated Upload Access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'news-images' AND 
  auth.role() IN ('authenticated', 'service_role')
);

-- 认证用户更新策略 - 允许已登录用户更新文件
CREATE POLICY "Authenticated Update Access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'news-images' AND 
  auth.role() IN ('authenticated', 'service_role')
);

-- 认证用户删除策略 - 允许已登录用户删除文件
CREATE POLICY "Authenticated Delete Access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'news-images' AND 
  auth.role() IN ('authenticated', 'service_role')
);

-- 4. 验证设置
SELECT 
  'Bucket Status' as type,
  name,
  public,
  file_size_limit,
  array_to_string(allowed_mime_types, ', ') as allowed_types
FROM storage.buckets 
WHERE name = 'news-images'

UNION ALL

SELECT 
  'Policy Status' as type,
  name as name,
  command,
  COALESCE(array_to_string(roles, ', '), 'public') as roles,
  definition
FROM storage.policies 
WHERE bucket_id = 'news-images';

-- =====================================
-- 修复说明
-- =====================================

/*
执行此SQL语句后，news-images存储桶应该具有以下功能：

✅ 公开读取：任何人都可以通过URL访问图片
✅ 认证上传：只有登录用户可以上传图片  
✅ 认证更新：只有登录用户可以更新图片
✅ 认证删除：只有登录用户可以删除图片

如果仍然无法访问，请检查：
1. 用户是否已登录
2. 环境变量配置是否正确
3. 网络连接是否正常
4. 浏览器控制台是否有错误信息
*/