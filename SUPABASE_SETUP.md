# Supabase 数据库设置指南

## 概述

新闻管理页面已集成 Supabase，用于替代传统的 REST API。

## 环境变量配置

确保您的 `.env.local` 文件包含以下配置：

```env
VITE_SUPABASE_URL=https://vntvrdkjtfdcnvwgrubo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODkzNDYsImV4cCI6MjA3OTI2NTM0Nn0.j-7YWagbcUaKKDskzgkNpZMAXvEZJAiJ1B5zxL_sRew
DATABASE_URL=https://vntvrdkjtfdcnvwgrubo.supabase.co
```

## 数据库表结构

### 1. news_categories 表

```sql
CREATE TABLE news_categories (
  idx INT PRIMARY KEY,
  id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入示例数据
INSERT INTO news_categories (idx, id, name) VALUES
(0, '292869b1-2083-48ab-a236-23fe38fbee04', '通知公告'),
(1, '6799def2-0140-4529-b0cf-9d4ac51f7ec2', '学生作品'),
(2, '7f463220-3b2d-4162-a36d-45059b4c5624', '师资力量'),
(3, 'e3293699-59b9-459b-a597-e9bf713434d5', '学院动态'),
(4, 'fdf48745-bf37-4e44-89ea-6bdf715d6bb5', '活动赛事');
```

### 2. news 表

```sql
CREATE TABLE news (
  idx INT PRIMARY KEY,
  id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES news_categories(id) ON DELETE CASCADE,
  is_top BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT
);

-- 创建外键约束（如果还没有的话）
ALTER TABLE news ADD CONSTRAINT news_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE CASCADE;

-- 插入示例数据
INSERT INTO news (idx, id, title, content, category_id, is_top, is_pinned, published_at, image_url) VALUES
(0, 'b31b2f1e-dab9-40a4-90d8-5729a30b1a29', '计算机学院2024年毕业典礼圆满举行', '2024年6月20日，计算机学院在学院大礼堂举行了2024届毕业典礼。', 'e3293699-59b9-459b-a597-e9bf713434d5', FALSE, TRUE, '2024-06-20 09:00:00+00', '毕业典礼图片.png'),
(1, 'bd35ef33-4068-4e93-b328-5f39a8b5d468', '第47届ACM程序设计竞赛校选赛成功举办', '2024年8月5日，我院成功举办了第47届ACM国际大学生程序设计竞赛校选赛。', 'fdf48745-bf37-4e44-89ea-6bdf715d6bb5', FALSE, FALSE, '2024-08-05 16:45:00+00', 'ACM比赛.png'),
(2, 'eb1ddd37-e915-4526-bdf3-e4512db8ec93', '关于2024年秋季学期课程调整的通知', '根据学校教学安排，2024年秋季学期部分课程时间有所调整。', '292869b1-2083-48ab-a236-23fe38fbee04', FALSE, FALSE, '2024-08-15 10:00:00+00', '教学安排.png'),
(3, 'f32d53fd-ec28-4e8b-835d-7ab9d6f1cd3c', '我院学子在创新设计大赛中斩获佳绩', '在2024年全国大学生创新设计大赛中，我院学生团队的作品。', '6799def2-0140-4529-b0cf-9d4ac51f7ec2', FALSE, FALSE, '2024-07-10 15:30:00+00', '创新.png');
```

## RLS (行级安全) 设置

```sql
-- 启用 RLS
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取新闻分类
CREATE POLICY "Allow public read access to news_categories" ON news_categories
  FOR SELECT USING (true);

-- 允许所有用户读取新闻
CREATE POLICY "Allow public read access to news" ON news
  FOR SELECT USING (true);

-- 允许所有用户创建新闻（根据需要调整）
CREATE POLICY "Allow insert access to news" ON news
  FOR INSERT WITH CHECK (true);

-- 允许所有用户更新新闻（根据需要调整）
CREATE POLICY "Allow update access to news" ON news
  FOR UPDATE USING (true);

-- 允许所有用户删除新闻（根据需要调整）
CREATE POLICY "Allow delete access to news" ON news
  FOR DELETE USING (true);
```

## 功能特性

### ✅ 已实现的 Supabase 功能

1. **数据获取**
   - `getNewsCategories()` - 获取新闻分类列表
   - `getNewsList()` - 获取新闻列表（包含关联分类）
   - `getNewsById()` - 根据ID获取单个新闻

2. **CRUD 操作**
   - `createNews()` - 创建新闻
   - `updateNews()` - 更新新闻
   - `deleteNews()` - 删除新闻

3. **搜索功能**
   - `searchNews()` - 按关键词、分类、日期范围搜索

4. **错误处理**
   - 完整的错误捕获和日志记录
   - API失败时自动降级到静态数据

## 使用说明

1. **访问页面**: `http://localhost:5176/news-management`
2. **数据同步**: 页面会自动从 Supabase 获取最新数据
3. **实时更新**: 所有操作会立即同步到数据库
4. **错误处理**: 网络错误时显示提示并提供重试按钮

## 调试技巧

1. **打开浏览器控制台**查看详细日志
2. **检查 Supabase Dashboard** 确认数据表结构
3. **验证环境变量**确保 Supabase URL 和 Key 正确
4. **检查 RLS 策略**确保数据访问权限正确

## 常见问题

### Q: 页面显示加载中但没有数据？
A: 
1. 检查 Supabase 连接和表结构
2. 确保环境变量正确
3. 打开浏览器控制台查看详细错误信息
4. 检查表名是否正确（`news` 和 `news_categories`）

### Q: 操作失败？
A: 
1. 检查 RLS 策略是否允许相应的操作
2. 确认外键关系正确设置
3. 检查字段名是否匹配

### Q: 图片不显示？
A: 确保 `image_url` 字段包含正确的图片路径或URL。

### Q: 关系查询错误 (PGRST201)？
A: 
1. 确保外键约束正确设置
2. 检查表之间的关系命名
3. 当前代码已简化为避免关系查询问题

### Q: 数据库表不存在？
A: 
1. 在 Supabase Dashboard 的 SQL Editor 中运行提供的 SQL 脚本
2. 确保表名和字段名完全匹配（区分大小写）
3. 检查外键约束是否正确建立

## 注意事项

1. 确保数据库表结构与代码中的接口匹配
2. 检查外键关系（`category_id` 引用 `news_categories.id`）
3. 配置适当的 RLS 策略以保护数据安全
4. 在生产环境中使用更严格的安全策略