-- =====================================
-- news-images 存储桶完整访问策略
-- =====================================

-- 1. 公开读取策略 - 允许任何人查看图片
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'news-images');

-- 2. 认证用户上传策略 - 允许已登录用户上传图片
CREATE POLICY "Authenticated Upload Access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'news-images' AND 
  auth.role() = 'authenticated'
);

-- 3. 认证用户更新策略 - 允许已登录用户更新图片
CREATE POLICY "Authenticated Update Access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'news-images' AND 
  auth.role() = 'authenticated'
);

-- 4. 认证用户删除策略 - 允许已登录用户删除图片
CREATE POLICY "Authenticated Delete Access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'news-images' AND 
  auth.role() = 'authenticated'
);

-- =====================================
-- 验证策略设置
-- =====================================

SELECT 
  name,
  command,
  roles,
  definition
FROM storage.policies 
WHERE bucket_id = 'news-images'
ORDER BY command;