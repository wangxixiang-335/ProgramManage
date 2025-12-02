-- =====================================
-- 为 new-images 存储桶设置访问策略
-- 在 Supabase SQL 编辑器中执行
-- =====================================

-- 1. 确保存储桶存在
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'new-images',
  'new-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. 删除可能冲突的现有策略
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Full Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;

-- 3. 设置new-images桶的访问策略

-- 公开读取策略 - 允许任何人读取new-images桶中的文件
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'new-images');

-- 认证用户上传策略 - 允许已登录用户上传文件到new-images桶
CREATE POLICY "Authenticated Upload Access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'new-images' AND 
  auth.role() IN ('authenticated', 'service_role')
);

-- 认证用户更新策略 - 允许已登录用户更新new-images桶中的文件
CREATE POLICY "Authenticated Update Access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'new-images' AND 
  auth.role() IN ('authenticated', 'service_role')
);

-- 认证用户删除策略 - 允许已登录用户删除new-images桶中的文件
CREATE POLICY "Authenticated Delete Access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'new-images' AND 
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
WHERE name = 'new-images'

UNION ALL

SELECT 
  'Policy Status' as type,
  name as name,
  command,
  COALESCE(array_to_string(roles, ', '), 'public') as roles,
  definition
FROM storage.policies 
WHERE bucket_id = 'new-images'
ORDER BY type, name;

-- 5. 显示配置摘要
SELECT 
  'new-images存储桶配置完成' as status,
  '公开读取、认证用户可上传/更新/删除' as permissions,
  '图片最大5MB，支持常见格式' as limits;

-- =====================================
-- 使用说明
-- =====================================

/*
执行此SQL后，new-images存储桶将具有：

✅ 存储桶状态：
- 名称: new-images
- 公开访问: 是
- 文件大小限制: 5MB
- 支持格式: JPG, PNG, GIF, WebP

✅ 访问策略：
- 公开读取: 任何人可以通过URL访问图片
- 上传权限: 需要登录用户
- 更新权限: 需要登录用户  
- 删除权限: 需要登录用户

🌐 URL格式：
https://your-project.supabase.co/storage/v1/object/public/new-images/filename.jpg

📝 测试上传：
访问 http://localhost:5173/news-management
点击"新增新闻"并上传图片测试功能
*/