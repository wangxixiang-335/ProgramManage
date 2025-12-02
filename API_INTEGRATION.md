# 新闻管理系统 API 集成指南

## 概述

新闻管理页面已集成完整的API调用功能，支持与后端数据库的实时数据同步。

## 功能特性

### ✅ 已实现的功能

1. **数据获取**
   - 自动获取新闻分类列表
   - 自动获取新闻列表
   - 支持按ID获取单个新闻详情

2. **CRUD 操作**
   - ✅ 新增新闻 (createNews)
   - ✅ 编辑新闻 (updateNews) 
   - ✅ 删除新闻 (deleteNews)
   - ✅ 列表查询 (getNewsList)

3. **用户体验**
   - 加载状态显示
   - 错误处理和重试机制
   - 数据刷新按钮
   - 实时数据更新

4. **备用方案**
   - API失败时自动使用静态数据
   - 确保页面始终可用

## API 接口规范

### 基础URL
```
http://localhost:3000/api
```

### 端点列表

#### 1. 获取新闻分类
```
GET /news-categories
Response: {
  "data": [
    {
      "idx": 0,
      "id": "uuid",
      "name": "通知公告",
      "created_at": "timestamp"
    }
  ]
}
```

#### 2. 获取新闻列表
```
GET /news
Response: {
  "data": [
    {
      "idx": 0,
      "id": "uuid",
      "title": "新闻标题",
      "content": "新闻内容",
      "category_id": "uuid",
      "is_top": false,
      "is_pinned": false,
      "published_at": "timestamp",
      "image_url": "图片URL"
    }
  ]
}
```

#### 3. 创建新闻
```
POST /news
Body: {
  "title": "新闻标题",
  "content": "新闻内容",
  "category_id": "uuid",
  "image_url": "图片URL",
  "is_top": false,
  "is_pinned": false
}
```

#### 4. 更新新闻
```
PUT /news/:id
Body: {
  "title": "更新的标题",
  "content": "更新的内容"
  // 其他要更新的字段
}
```

#### 5. 删除新闻
```
DELETE /news/:id
Response: { "success": true }
```

## 配置说明

### 环境变量

在 `.env.local` 文件中配置API地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 开发模式

当前页面支持两种运行模式：

1. **API模式**：连接真实的后端API
2. **备用模式**：使用本地静态数据（当API不可用时）

## 数据结构

### NewsItem 接口
```typescript
interface NewsItem {
  idx: number;
  id: string;
  title: string;
  content: string;
  category_id: string;
  is_top: boolean;
  is_pinned: boolean;
  published_at: string;
  image_url: string;
}
```

### NewsCategory 接口
```typescript
interface NewsCategory {
  idx: number;
  id: string;
  name: string;
  created_at: string;
}
```

## 错误处理

页面包含完整的错误处理机制：

- **网络错误**：显示错误提示并提供重试按钮
- **API错误**：自动降级到静态数据
- **加载状态**：显示加载动画和提示

## 实时更新

页面支持多种数据更新方式：

1. **自动加载**：页面启动时自动获取最新数据
2. **手动刷新**：点击刷新按钮更新数据
3. **操作后更新**：增删改操作后自动更新列表

## 后端实现建议

### Node.js + Express 示例

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 新闻分类
app.get('/api/news-categories', (req, res) => {
  // 从数据库获取分类列表
  res.json({ data: categories });
});

// 新闻列表
app.get('/api/news', (req, res) => {
  // 从数据库获取新闻列表
  res.json({ data: news });
});

// 创建新闻
app.post('/api/news', (req, res) => {
  // 插入数据库
  res.json({ data: newNews });
});

// 更新新闻
app.put('/api/news/:id', (req, res) => {
  // 更新数据库
  res.json({ data: updatedNews });
});

// 删除新闻
app.delete('/api/news/:id', (req, res) => {
  // 从数据库删除
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('API server running on port 3000');
});
```

## 测试

1. 启动后端API服务器
2. 配置正确的API地址
3. 访问 `http://localhost:5173/news-management`
4. 测试所有CRUD功能

## 注意事项

1. 确保CORS配置正确
2. API响应格式符合规范
3. 错误处理完善
4. 数据验证充分
5. 安全认证到位（生产环境）