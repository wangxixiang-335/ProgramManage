# Supabase Storage 存储桶设置指南

## 问题描述
学生端成果发布时出现错误：`Bucket not found`
这表示Supabase Storage中缺少必要的存储桶。

## 解决方案

### 方法一：通过Supabase控制台设置（推荐）

#### 1. 登录Supabase控制台
- 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
- 选择您的项目（vntvrdkjtfdcnvwgrubo）

#### 2. 创建存储桶

##### 创建 achievement-images 存储桶
1. 在左侧导航栏选择 "Storage"
2. 点击 "New bucket"
3. 填写信息：
   - **Name**: `achievement-images`
   - **Public bucket**: ✅ 勾选（公开访问）
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
4. 点击 "Save"

##### 创建 achievement-videos 存储桶
1. 再次点击 "New bucket"
2. 填写信息：
   - **Name**: `achievement-videos`
   - **Public bucket**: ✅ 勾选（公开访问）
   - **File size limit**: `209715200` (200MB)
   - **Allowed MIME types**: `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/webm`
3. 点击 "Save"

#### 3. 设置访问策略

##### 为 achievement-images 设置策略
1. 点击 `achievement-images` 存储桶
2. 点击 "Settings" 标签
3. 在 "Policies" 部分点击 "New policy"
4. 选择 "For full custom access"
5. 输入以下策略：

```sql
-- 公共读取权限
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-images');

-- 用户上传权限
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-images' 
  AND auth.role() = 'authenticated'
);

-- 用户更新权限
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'achievement-images'
  AND auth.role() = 'authenticated'
);
```

##### 为 achievement-videos 设置策略
1. 点击 `achievement-videos` 存储桶
2. 重复相同步骤，使用以下策略：

```sql
-- 公共读取权限
CREATE POLICY "Public videos are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'achievement-videos');

-- 用户上传权限
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'
);

-- 用户更新权限
CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'achievement-videos'
  AND auth.role() = 'authenticated'
);
```

### 方法二：通过SQL执行（快速）

在Supabase控制台的 "SQL Editor" 中执行以下SQL：

```sql
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
```

## 验证设置

完成设置后，可以通过以下方式验证：

1. **检查存储桶列表**：在Storage页面应该看到两个新的存储桶
2. **测试文件上传**：尝试在成果发布页面上传文件
3. **检查公共访问**：确认上传的文件可以通过公共URL访问

## 临时解决方案

如果暂时无法设置存储桶，可以：

1. **跳过文件上传**：发布成果时不包含封面图和视频
2. **使用外部链接**：将文件上传到其他服务，然后在描述中添加链接

## 注意事项

1. **权限设置**：确保存储桶设置为公开访问，否则前端无法显示文件
2. **文件大小限制**：根据实际需求调整大小限制
3. **MIME类型**：确保允许的文件类型符合业务需求
4. **存储成本**：Supabase Storage有免费额度，超出部分会产生费用

## 故障排除

### 常见错误

1. **"Bucket not found"** - 存储桶未创建
   - 解决：按照上述步骤创建存储桶

2. **"Permission denied"** - 策略未正确设置
   - 解决：检查并重新设置RLS策略

3. **"File too large"** - 文件超出大小限制
   - 解决：减小文件大小或调整限制

4. **"Invalid MIME type"** - 不支持的文件类型
   - 解决：检查文件类型，确保在允许列表中

### 调试方法

1. 打开浏览器开发者工具
2. 查看Network标签中的请求
3. 检查具体的错误消息
4. 在Supabase控制台的Storage中查看文件

## 联系支持

如果遇到问题，可以：
1. 查看Supabase官方文档
2. 联系项目开发人员
3. 在控制台中查看详细错误信息