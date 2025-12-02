# Supabase 存储桶设置指南

## 概述

本项目已集成了 Supabase Storage 功能，用于存储新闻管理中的图片。系统会自动创建一个名为 `news-images` 的存储桶来管理所有新闻图片。

## 功能特性

- ✅ 自动创建存储桶
- ✅ 图片上传（支持拖拽和点击）
- ✅ 图片格式验证（JPG, PNG, GIF, WebP）
- ✅ 文件大小限制（5MB）
- ✅ 图片预览和删除
- ✅ 公开访问URL生成
- ✅ 错误处理和用户反馈

## 文件结构

```
src/
├── services/
│   └── supabaseStorageService.ts    # 存储服务层
├── utils/
│   └── initSupabaseStorage.ts       # 初始化工具
├── pages/p-news_management/
│   └── index.tsx                    # 新闻管理页面（集成上传功能）
└── lib/
    └── supabase.ts                  # Supabase客户端配置
```

## 快速开始

### 1. 环境配置

确保 `.env.local` 文件包含正确的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 自动初始化

应用启动时会自动检查并创建 `news-images` 存储桶：

```typescript
// 在新闻管理页面中
import { setupStorageOnInit } from '../../utils/initSupabaseStorage';

useEffect(() => {
  // ...其他初始化代码
  setupStorageOnInit(); // 自动设置存储桶
}, []);
```

### 3. 手动创建存储桶（可选）

如果自动创建失败，可以在 Supabase Dashboard 的 SQL 编辑器中执行：

```sql
-- 创建news-images存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
```

## 使用方法

### 图片上传

1. 访问新闻管理页面：`http://localhost:5173/news-management`
2. 点击"新增新闻"或编辑现有新闻
3. 在"上传图片"区域点击或拖拽图片文件
4. 系统会自动上传并生成公共URL
5. 上传成功后可以预览和删除图片

### API 使用示例

```typescript
import { 
  uploadNewsImage, 
  deleteNewsImage, 
  getNewsImageUrl 
} from '../services/supabaseStorageService';

// 上传图片
const file = e.target.files[0];
const imageUrl = await uploadNewsImage(file);

// 删除图片
await deleteNewsImage('image-name.jpg');

// 获取图片URL
const url = getNewsImageUrl('image-name.jpg');
```

## 存储配置

| 配置项 | 值 | 说明 |
|--------|----|------|
| 存储桶名称 | `news-images` | 存储新闻图片的桶 |
| 公开访问 | `true` | 图片可通过公共URL访问 |
| 文件大小限制 | `5MB` | 单个文件最大5MB |
| 支持格式 | `image/*` | 所有图片格式 |
| 上传方式 | 自动/手动 | 支持拖拽和点击上传 |

## 错误处理

系统包含完整的错误处理机制：

- **文件类型验证**：只允许图片格式
- **文件大小验证**：超过5MB会提示错误
- **上传失败重试**：网络错误时提供重试选项
- **存储桶创建失败**：自动降级到本地存储

## 安全考虑

- 上传的文件会进行类型和大小验证
- 存储桶设置为公开访问，但可以通过RLS策略进一步控制
- 文件名自动添加时间戳前缀避免冲突

## 故障排除

### 常见问题

1. **上传失败：权限错误**
   - 检查 Supabase API 密钥是否正确
   - 确认存储桶权限设置

2. **无法创建存储桶**
   - 手动执行SQL语句创建
   - 检查用户权限

3. **图片无法显示**
   - 确认存储桶是否设置为公开
   - 检查CORS设置

### 调试工具

运行存储配置检查脚本：

```bash
node scripts/setup-storage.js
```

## 更新日志

- **v1.0.0**：初始版本，支持基本图片上传和存储桶管理
- 自动存储桶创建和初始化
- 完整的错误处理和用户反馈
- 集成到新闻管理界面