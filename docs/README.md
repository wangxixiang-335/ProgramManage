# 项目文档

本文档目录包含了河北师范大学软件学院项目管理系统（软院项目通）的所有相关文档。

## 📁 文档结构

### 📖 指南文档 (`docs/guides/`)
包含用户使用指南和功能说明：
- `ACHIEVEMENT_PUBLISH_IMPLEMENTATION.md` - 成果发布功能实现指南
- `ACHIEVEMENT_SETUP_GUIDE.md` - 成果模块设置指南
- `APPROVAL_FLOW_GUIDE.md` - 审批流程使用指南
- `UPLOAD_FIX_GUIDE.md` - 文件上传问题修复指南

### ⚙️ 环境设置 (`docs/setup/`)
包含系统部署和配置相关文档：
- `SUPABASE_ACHIEVEMENTS_ACCESS_GUIDE.md` - Supabase成果模块访问配置
- `STORAGE_SETUP_GUIDE.md` - 存储桶设置指南
- `QUICK_FIX_STORAGE.md` - 存储问题快速修复
- `STORAGE_ISSUE_RESOLVED.md` - 存储问题解决方案

### 🗄️ 数据库脚本 (`docs/database/`)
包含数据库相关的SQL脚本：
- `fix-database-schema.sql` - 数据库架构修复脚本
- `fix-storage-policies.sql` - 存储权限策略修复脚本
- `quick-create-buckets.sql` - 快速创建存储桶脚本

### 🔧 开发文档 (`docs/development/`)
包含开发过程中产生的文档和脚本：
- `STATUS_TYPE_ISSUE_RESOLVED.md` - 状态类型问题解决方案
- `check-storage.js` - 存储检查脚本
- `check-users.js` - 用户检查脚本
- `setup-storage-buckets.js` - 存储桶设置脚本
- `setup-storage.js` - 存储设置脚本
- `test-db-connection.js` - 数据库连接测试脚本
- `test-env.js` - 环境变量测试脚本
- `test-storage-connection.js` - 存储连接测试脚本

## 📋 使用说明

### 首次部署
1. 阅读 `docs/setup/` 目录下的文档
2. 运行 `docs/database/` 中的SQL脚本
3. 测试系统功能

### 开发维护
1. 查看 `docs/development/` 中的测试脚本
2. 参考 `docs/guides/` 中的功能指南
3. 使用 `docs/database/` 中的脚本进行数据库维护

### 问题排查
1. 检查相应的指南文档
2. 运行相关测试脚本
3. 查看问题解决方案文档

## 📞 技术支持

如需技术支持，请提供：
1. 问题描述和错误截图
2. 相关的操作步骤
3. 环境配置信息

---

**最后更新**: 2025-11-29  
**版本**: v1.0