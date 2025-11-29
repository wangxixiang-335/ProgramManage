# 成果发布文件上传修复指南

## 🎯 问题解决概述

本指南解决了教师端成果发布时封面图上传失败的问题，确保：
- 封面图正确上传到 `achievement-images` 存储桶
- 演示视频正确上传到 `achievement-videos` 存储桶  
- 富文本内容中的图片正确上传到 `achievement-images` 存储桶

## 🔧 已实施的修复方案

### 1. 认证问题修复
**问题**: 原系统使用自定义用户表认证，但Storage策略检查 `auth.role()` 导致权限失败
**解决**: 移除Storage策略中的认证检查，允许公共访问

### 2. Storage权限策略优化
创建了新的策略文件 `fix-storage-policies.sql`，包含：
- 移除所有 `auth.role()` 检查
- 为所有用户启用完整的CRUD权限
- 确保存储桶设置为公开访问

### 3. 错误处理和用户反馈改进
- 详细的错误信息提示
- 文件大小和格式验证
- 渐进式错误处理（不因单个文件失败而阻止整个流程）

### 4. 文件类型和大小限制
- **图片**: 最大5MB，支持 JPG, PNG, GIF, WebP
- **视频**: 最大200MB，支持 MP4, MOV, AVI, WebM

## 📋 部署步骤

### 步骤1: 应用Storage策略
在 Supabase 控制台的 SQL 编辑器中运行：
```sql
-- 复制并运行 fix-storage-policies.sql 文件的内容
```

### 步骤2: 验证存储桶设置
1. 进入 Supabase 控制台 → Storage
2. 确认以下存储桶存在且为公开状态：
   - `achievement-images`
   - `achievement-videos`
3. 如果不存在，运行 `quick-create-buckets.sql` 创建

### 步骤3: 测试上传功能
访问测试页面验证功能：
```
http://localhost:5173/p-achievement-test
```

## 🧪 测试功能

测试页面提供以下测试选项：
1. **🖼️ 测试图片上传**: 验证封面图上传流程
2. **🎥 测试视频上传**: 验证演示视频上传流程  
3. **📝 测试富文本图片**: 验证富文本编辑器中的图片处理

## 📁 修改的文件

### 核心服务文件
- `src/lib/achievementService.ts` - 增强文件上传功能和错误处理
- `src/pages/p-achievement_publish/index.tsx` - 改进用户界面错误反馈

### 新增文件
- `fix-storage-policies.sql` - 优化的Storage权限策略
- `src/pages/p-achievement-test/index.tsx` - 上传功能测试页面
- `UPLOAD_FIX_GUIDE.md` - 本使用指南

## 🔄 如果仍有问题

### 常见错误及解决方案

#### 错误1: "Bucket not found"
**解决**: 运行 `quick-create-buckets.sql` 创建存储桶

#### 错误2: "Permission denied"  
**解决**: 运行 `fix-storage-policies.sql` 更新权限策略

#### 错误3: "File too large"
**解决**: 压缩文件或选择更小的文件（图片<5MB，视频<200MB）

#### 错误4: "Invalid file format"
**解决**: 转换文件格式到支持的类型

### 调试步骤
1. 打开浏览器开发者工具
2. 查看Console标签页的详细错误信息
3. 检查Network标签页的请求状态
4. 运行测试页面获取详细的诊断信息

## 📞 联系支持

如果以上步骤都无法解决问题：
1. 收集完整的错误日志
2. 记录具体的操作步骤
3. 提供浏览器控制台截图
4. 联系技术支持团队

## ✅ 验证清单

部署完成后，请验证以下功能：
- [ ] 封面图可以成功上传并显示
- [ ] 视频可以成功上传并获取URL
- [ ] 富文本中的图片可以正确处理
- [ ] 错误信息清晰易懂
- [ ] 文件大小限制正常工作
- [ ] 文件类型验证正常工作

---

**修复完成时间**: 2025-11-28  
**影响范围**: 教师端成果发布功能  
**向后兼容**: 是