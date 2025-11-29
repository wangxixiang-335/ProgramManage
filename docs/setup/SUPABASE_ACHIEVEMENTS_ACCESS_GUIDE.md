# Supabase Achievements表访问指南

## 🔍 问题诊断工具

我已经创建了多个工具来帮助你正确访问Supabase数据库中的achievements表：

### 1. 数据库诊断工具
**访问地址**: `/database-diagnostic`
**功能**: 全面检查数据库连接、表结构、权限等问题

### 2. 成果表测试工具  
**访问地址**: `/achievement-db-test`
**功能**: 专门测试achievements表和achievement_types表的访问

## 🛠️ 修复步骤

### 第一步：运行诊断
1. 启动项目：`npm run dev`
2. 访问：`http://localhost:5173/database-diagnostic`
3. 点击"运行诊断"按钮
4. 查看诊断结果，确定具体问题

### 第二步：检查表结构
如果诊断发现表不存在或结构错误，请：

1. **在Supabase控制台中运行修复脚本**：
   - 打开 `achievements_table_fix.sql` 文件
   - 复制SQL代码到Supabase控制台的SQL编辑器
   - 执行脚本创建/修复表结构

2. **验证表结构**：
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'achievements' 
   ORDER BY ordinal_position;
   ```

### 第三步：检查权限设置
确保RLS（行级安全）策略正确配置：

```sql
-- 查看现有的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'achievements';

-- 应该有以下策略：
-- 1. 用户可以查看自己的成果
-- 2. 用户可以插入自己的成果  
-- 3. 用户可以更新自己的成果
-- 4. 用户可以删除自己的成果
```

### 第四步：验证数据访问
访问：`http://localhost:5173/achievement-db-test`

这个工具会测试：
- 基本查询功能
- 关联查询（achievements + achievement_types）
- 状态筛选
- 权限控制

## 📋 必要的表结构

### achievements表
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type_id UUID REFERENCES achievement_types(id),
  cover_url VARCHAR(500),
  video_url VARCHAR(500),
  status SMALLINT CHECK (status IN (1, 2, 3, 4)), -- 1-草稿, 2-已通过, 3-审核中, 4-已拒绝
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  publisher_id UUID REFERENCES users(id),
  instructor_id UUID REFERENCES users(id),
  parents_id UUID REFERENCES achievements(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### achievement_types表
```sql
CREATE TABLE achievement_types (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 权限配置

### RLS策略示例
```sql
-- 用户可以查看自己的成果
CREATE POLICY "Users can view own achievements" ON achievements
FOR SELECT USING (auth.uid() = publisher_id);

-- 用户可以插入自己的成果
CREATE POLICY "Users can insert own achievements" ON achievements  
FOR INSERT WITH CHECK (auth.uid() = publisher_id);

-- 用户可以更新自己的成果
CREATE POLICY "Users can update own achievements" ON achievements
FOR UPDATE USING (auth.uid() = publisher_id);

-- 用户可以删除自己的成果
CREATE POLICY "Users can delete own achievements" ON achievements
FOR DELETE USING (auth.uid() = publisher_id);

-- 所有人可以查看成果类型
CREATE POLICY "Anyone can view achievement types" ON achievement_types
FOR SELECT USING (true);
```

## 🧪 测试数据

使用提供的模拟数据：
```bash
# 运行模拟数据脚本
# 文件: achievements_mock_data_updated.sql
```

## 🚀 前端集成

确认service文件正确配置：

### achievementService.ts
```typescript
// 确保正确导入supabase
import { supabase } from '../lib/supabase';

// 基本查询示例
const getAchievements = async () => {
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      achievement_types (name)
    `);
  return { data, error };
};
```

### 连接配置检查
```typescript
// 检查环境变量
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '设置' : '未设置');
```

## 🔧 常见问题解决

### 问题1: 表不存在
**症状**: `relation "achievements" does not exist`
**解决**: 运行 `achievements_table_fix.sql` 创建表

### 问题2: 权限被拒绝  
**症状**: `permission denied for table achievements`
**解决**: 检查RLS策略配置

### 问题3: 字段不存在
**症状**: `column "type_id" does not exist`
**解决**: 运行表结构修复脚本

### 问题4: 连接失败
**症状**: 网络错误或连接超时
**解决**: 检查Supabase URL和API密钥配置

## 📞 获取帮助

1. **先运行诊断工具**: `/database-diagnostic`
2. **检查控制台输出**: 查看详细错误信息
3. **验证表结构**: 确保SQL脚本执行成功
4. **测试数据访问**: 使用 `/achievement-db-test` 验证功能

## ✅ 验证清单

- [ ] Supabase项目已创建
- [ ] URL和API密钥正确配置
- [ ] achievements表已创建
- [ ] achievement_types表已创建  
- [ ] RLS策略已配置
- [ ] 模拟数据已插入
- [ ] 前端连接测试通过
- [ ] 基本CRUD操作正常

完成这些步骤后，achievements表应该可以正常访问了！