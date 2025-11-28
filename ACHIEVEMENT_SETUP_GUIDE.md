# 学生端成果发布功能部署指南

## 概述

本指南详细说明了如何部署和配置学生端的成果发布功能，确保数据能够正确存储到Supabase数据库的`achievements`表中。

## 数据库表结构

### achievements 表字段

| 字段名 | 类型 | 描述 | 必填 |
|--------|------|------|------|
| id | UUID | 主键 | 自动生成 |
| title | VARCHAR(200) | 成果标题 | ✅ |
| description | TEXT | 项目描述 | ❌ |
| type | VARCHAR(20) | 成果类型 | ✅ |
| cover_url | TEXT | 封面图片URL | ❌ |
| video_url | TEXT | 视频演示URL | ❌ |
| partners | TEXT[] | 合作伙伴数组 | ❌ |
| instructors | TEXT[] | 指导老师数组 | ❌ |
| content | TEXT | 富文本内容 | ✅ |
| attachments | TEXT[] | 附件URL数组 | ❌ |
| status | VARCHAR(20) | 状态 | ✅ |
| creator_id | UUID | 创建者ID | ✅ |
| approvers | UUID[] | 审批人ID数组 | ❌ |
| created_at | TIMESTAMP | 创建时间 | 自动生成 |
| updated_at | TIMESTAMP | 更新时间 | 自动生成 |

### 状态枚举值

- `draft`: 草稿
- `pending`: 审核中
- `approved`: 已通过
- `rejected`: 已拒绝

### 类型枚举值

- `project`: 项目报告
- `paper`: 论文
- `software`: 软件作品
- `experiment`: 实验报告
- `other`: 其他

## 部署步骤

### 1. 创建数据库表

在Supabase SQL编辑器中执行以下SQL文件：

```sql
-- 执行 database_achievements_updated.sql
```

### 2. 设置存储桶

确保存在 `achievement-files` 存储桶用于文件上传：

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('achievement-files', 'achievement-files', true)
ON CONFLICT (id) DO NOTHING;
```

### 3. 配置行级安全策略

已包含以下安全策略：

- 用户只能查看自己的成果
- 用户可以创建、更新、删除自己的成果
- 审批人可以查看分配给他们的待审批成果

### 4. 环境变量配置

确保 `.env.local` 文件包含正确的Supabase配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 功能特性

### 核心功能

1. **成果发布** (`/achievement-publish`)
   - 支持标题、描述、类型、封面图、视频等字段
   - 富文本编辑器
   - AI一键润色和布局
   - 文件上传（封面、视频、附件）

2. **成果管理** (`/achievement-management`)
   - 分类查看（全部、草稿箱、审核中、已通过、已拒绝）
   - 编辑草稿、删除、撤回功能

3. **数据库测试** (`/achievement-test`)
   - 测试数据库连接
   - 验证表结构
   - 测试数据CRUD操作

### 数据流程

1. **发布流程**：
   ```
   填写表单 → AI优化 → 文件上传 → 选择审批人 → 保存到数据库
   ```

2. **数据存储**：
   ```
   本地文件 → Supabase Storage → 获取URL → 存储到achievements表
   ```

3. **状态管理**：
   ```
   草稿 → 审核中 → 已通过/已拒绝
   ```

## 文件上传

### 支持的文件类型

- **封面图**: JPG, PNG (建议1200×675)
- **视频**: MP4, MOV (限制5分钟, 200MB)
- **附件**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (最多5个, 每个最大50MB)

### 存储路径

```
achievement-files/
├── covers/           # 封面图片
│   └── {userId}/
├── videos/           # 演示视频
│   └── {userId}/
└── attachments/      # 附件文件
    └── {userId}/
```

## API接口

### 核心服务函数

```typescript
// 保存草稿
saveDraft(achievementData: AchievementData): Promise<SaveDraftResponse>

// 发布成果
publishAchievement(achievementData: AchievementData, approvers: string[]): Promise<PublishResponse>

// 获取用户成果
getUserAchievements(userId: string): Promise<AchievementData[]>

// 文件上传
uploadFile(file: File, path: string): Promise<string | null>
```

## 错误处理

### 常见错误

1. **RLS权限错误**
   - 确保用户已登录
   - 检查安全策略配置

2. **文件上传失败**
   - 检查存储桶权限
   - 验证文件大小限制

3. **数据插入失败**
   - 检查必填字段
   - 验证数据类型

### 调试工具

使用 `/achievement-test` 页面进行以下测试：

- 数据库连接测试
- 表结构验证
- CRUD操作测试
- 文件上传测试

## 性能优化

### 前端优化

- 图片懒加载
- 文件压缩
- 防抖提交

### 后端优化

- 数据库索引
- CDN文件分发
- 缓存策略

## 安全考虑

### 数据安全

- 行级安全策略
- 用户身份验证
- 文件类型验证

### 访问控制

- 用户只能操作自己的成果
- 审批人权限限制
- 文件访问权限

## 监控和日志

### 关键指标

- 上传成功率
- 审批处理时间
- 用户活跃度

### 日志记录

- 操作日志
- 错误日志
- 性能监控

## 故障排除

### 常见问题

1. **无法连接数据库**
   - 检查环境变量
   - 验证网络连接

2. **文件上传失败**
   - 检查存储桶权限
   - 验证文件大小

3. **数据显示异常**
   - 检查数据格式
   - 验证查询逻辑

### 联系支持

如遇到问题，请：

1. 查看浏览器控制台错误
2. 使用测试页面诊断
3. 检查Supabase日志
4. 联系技术支持

---

## 快速开始

1. 执行数据库脚本
2. 配置环境变量
3. 启动应用
4. 访问 `/achievement-test` 进行测试
5. 开始使用 `/achievement-publish` 发布成果

🎉 **学生端成果发布功能现已就绪！**