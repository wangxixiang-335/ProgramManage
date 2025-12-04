# Achievement Attachments 设置指南

## 概述
`achievement_attachments` 存储桶用于保存成果附件，支持文件预览和下载功能。

## 相关文件

### 1. 核心设置文件

| 文件名 | 用途 | 状态 |
|--------|------|------|
| `create-achievement-attachments-bucket.sql` | 创建存储桶和数据库表 | ✅ 完成 |
| `setup-achievement-attachments-policies.sql` | 设置详细的存储策略 | ✅ 完成 |
| `fix-achievement-policies.sql` | 修复并设置公开访问权限 | ✅ 完成 |
| `achievement_attachments_test_data.sql` | 插入测试数据 | ✅ 已整理 |

### 2. 辅助文件

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `set-public-access-simple.sql` | 简单的公开访问设置 | 基础版本 |
| `set-complete-policies.sql` | 完整的权限策略设置 | 详细配置 |

## 执行顺序

### 首次设置（推荐）：
1. **创建存储桶和表**：
   ```sql
   -- 执行 create-achievement-attachments-bucket.sql
   ```

2. **设置存储策略**：
   ```sql
   -- 执行 setup-achievement-attachments-policies.sql
   ```

3. **插入测试数据**：
   ```sql
   -- 执行 achievement_attachments_test_data.sql
   ```

### 快速修复（如果已有基础设置）：
```sql
-- 执行 fix-achievement-policies.sql
```

## 功能特性

### ✅ 已实现功能
- [x] 创建 `achievement_attachments` 存储桶
- [x] 支持多种文件类型（图片、文档、视频、压缩包）
- [x] 文件大小限制：50MB
- [x] 公开访问权限（预览和下载）
- [x] RLS 安全策略
- [x] 文件URL标准化
- [x] 测试数据支持
- [x] 辅助函数和视图

### 🎯 支持的文件类型

#### 图片类
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

#### 文档类
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- 文本 (.txt, .csv)

#### 视频类
- MP4 (.mp4)
- WebM (.webm)
- OGG (.ogg)

#### 压缩包
- ZIP (.zip)
- RAR (.rar)
- 7Z (.7z)

## 访问方式

### 公共URL格式
```
https://your-project.supabase.co/storage/v1/object/public/achievement_attachments/achievements/{achievement_id}/{file_name}
```

### API 调用示例

#### 获取附件列表
```sql
SELECT * FROM achievement_attachments_view WHERE achievements_id = ?;
```

#### 获取下载URL
```sql
SELECT get_attachment_public_url(?) as url;
```

#### 检查访问权限
```sql
SELECT can_access_attachment(?, ?) as has_access;
```

## 测试数据

### 已包含的测试数据
1. **成果"星露谷物语"** - 2个附件
   - 游戏截图1.png (240KB, 图片)
   - 游戏说明文档.pdf (1MB, 文档)

2. **成果"22222"** - 2个附件
   - 项目报告.docx (512KB, 文档)
   - 演示视频.mp4 (20MB, 视频)

3. **成果"1"** - 1个附件
   - 设计方案.pdf (768KB, 文档)

### 数据统计
- 总记录数：5条
- 涉及成果：3个
- 文件类型：图片1个、视频1个、文档3个
- 总大小：约22MB

## 安全说明

### RLS 策略配置
- **公开读取**：所有用户可以预览和下载文件
- **认证上传**：只有认证用户可以上传文件
- **用户管理**：用户只能管理自己的文件
- **管理员权限**：管理员具有完整权限

### 权限等级
1. **SELECT** - 公开访问
2. **INSERT** - 认证用户
3. **UPDATE** - 文件所有者
4. **DELETE** - 文件所有者或管理员

## 故障排除

### 常见问题

#### 1. 文件无法预览
- 检查存储桶是否设置为公开
- 验证RLS策略是否正确配置
- 确认文件URL格式是否正确

#### 2. 上传失败
- 检查文件大小是否超过50MB限制
- 验证文件类型是否在允许列表中
- 确认用户是否已认证

#### 3. 权限问题
- 执行 `fix-achievement-policies.sql` 修复权限
- 检查存储桶设置：`SELECT * FROM storage.buckets WHERE id = 'achievement_attachments';`
- 验证策略配置：`SELECT * FROM storage.policies WHERE bucket_id = 'achievement_attachments';`

### 调试查询

#### 检查存储桶状态
```sql
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'achievement_attachments';
```

#### 检查策略配置
```sql
SELECT 
    name,
    cmd,
    permissive,
    roles
FROM storage.policies 
WHERE bucket_id = 'achievement_attachments'
ORDER BY cmd;
```

#### 检查附件数据
```sql
SELECT 
    COUNT(*) as total_attachments,
    COUNT(DISTINCT achievements_id) as achievements_with_attachments,
    SUM(file_size) as total_storage_used
FROM achievement_attachments;
```

## 维护建议

### 定期检查
1. 监控存储使用情况
2. 检查失效的文件链接
3. 清理无效的测试数据

### 性能优化
1. 为大文件添加压缩
2. 实施缓存策略
3. 定期备份重要文件

### 安全更新
1. 定期更新RLS策略
2. 监控异常访问行为
3. 限制文件上传频率

---

**更新时间**：2025-12-04  
**版本**：v1.0  
**维护者**：项目团队