-- 为 news-images 存储桶设置公开访问策略
-- 在 Supabase SQL 编辑器中执行

-- 允许任何人读取 news-images 桶中的文件（公开访问）
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'news-images');

-- 验证策略是否设置成功
SELECT name, command, roles FROM storage.policies WHERE bucket_id = 'news-images';