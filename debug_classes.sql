-- 调试班级查询
-- 检查表是否存在以及数据结构

-- 检查 classes 表
SELECT 'classes table structure' as info;
\d classes;

-- 检查 grades 表
SELECT 'grades table structure' as info;
\d grades;

-- 检查数据
SELECT 'classes data' as info, COUNT(*) as count FROM classes;
SELECT 'grades data' as info, COUNT(*) as count FROM grades;

-- 测试简单查询
SELECT 'simple classes query' as info;
SELECT id, name, grade_id FROM classes ORDER BY grade_id DESC, name ASC LIMIT 5;

-- 测试关联查询
SELECT 'join query' as info;
SELECT 
  c.id, 
  c.name, 
  c.grade_id,
  g.name as grade_name 
FROM classes c 
LEFT JOIN grades g ON c.grade_id = g.id 
ORDER BY c.grade_id DESC, c.name ASC 
LIMIT 5;

-- 检查 users 表结构
SELECT 'users table structure' as info;
\d users;

-- 检查 users 表中的 class_id 字段
SELECT 'users class_id field' as info;
SELECT id, username, full_name, role, class_id FROM users WHERE role = 1 LIMIT 5;