# 教师端成果发布封面图上传失败 - 快速修复指南

## 问题描述
教师端成果发布时封面图上传失败，原因是 Supabase Storage 中缺少必需的存储桶。

## 解决方案

### 方法一：使用 SQL 脚本（推荐）

1. 打开 Supabase 控制台：https://supabase.com/dashboard
2. 选择您的项目
3. 进入 SQL 编辑器
4. 运行项目根目录下的 `create-storage-buckets.sql` 文件中的 SQL 语句

### 方法二：手动创建存储桶

1. 在 Supabase 控制台中进入 Storage 部分
2. 点击 "New bucket" 创建存储桶

**创建 achievement-images 存储桶：**
- Name: `achievement-images`
- Public bucket: ✅ (是)
- File size limit: 5242880 (5MB)
- Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`

**创建 achievement-videos 存储桶：**
- Name: `achievement-videos`
- Public bucket: ✅ (是)
- File size limit: 209715200 (200MB)
- Allowed MIME types: `video/mp4, video/quicktime, video/x-msvideo, video/webm`

### 方法三：使用诊断页面

访问 `http://localhost:5173/p-storage-check` 页面查看存储状态和详细错误信息。

## 验证修复结果

1. 运行存储检查脚本：
```bash
node check-storage.js
```

2. 或者访问诊断页面进行测试

3. 尝试上传封面图验证是否修复

## 常见问题

### Q: 提示 "Bucket not found" 错误
A: 说明存储桶未创建成功，请重新检查 SQL 是否执行成功

### Q: 提示 "权限不足" 错误
A: 确保存储桶设置为公开访问，并已设置正确的 RLS 策略

### Q: 上传文件大小超过限制
A: 检查文件大小是否符合存储桶的大小限制设置

## 代码层面的优化

系统已经添加了优雅的错误处理：
- 当存储桶不存在时，会显示详细的解决方案
- 即使上传失败，用户仍可以选择继续发布成果（不含封面图）
- 提供了详细的错误信息和修复指导

## 测试步骤

1. 创建存储桶后，访问成果发布页面
2. 尝试上传封面图
3. 检查是否能成功获取公共 URL
4. 发布成果并验证封面图是否正确显示

如问题仍未解决，请检查：
- Supabase 项目的权限设置
- API 密钥是否正确
- 网络连接是否正常