-- 修复 achievements 表中 status 字段的类型
-- 将 smallint 改为 varchar，以支持字符串状态值

-- 方案1：修改现有字段（推荐）
ALTER TABLE achievements 
ALTER COLUMN status TYPE VARCHAR(20) USING 
CASE status
  WHEN 0 THEN 'draft'
  WHEN 1 THEN 'pending'  
  WHEN 2 THEN 'approved'
  WHEN 3 THEN 'rejected'
  ELSE 'pending'
END;

-- 添加约束确保状态值有效
ALTER TABLE achievements 
ADD CONSTRAINT check_status 
CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- 方案2：如果不想修改现有字段，可以创建视图
CREATE OR REPLACE VIEW achievements_with_status AS
SELECT 
  id,
  title,
  description,
  type_id,
  cover_url,
  video_url,
  CASE status
    WHEN 0 THEN 'draft'
    WHEN 1 THEN 'pending'  
    WHEN 2 THEN 'approved'
    WHEN 3 THEN 'rejected'
    ELSE 'pending'
  END as status,
  score,
  publisher_id,
  instructor_id,
  parents_id,
  created_at,
  updated_at
FROM achievements;

-- 方案3：创建状态映射表
CREATE TABLE IF NOT EXISTS achievement_status_mapping (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO achievement_status_mapping (id, name) VALUES
(0, 'draft'),
(1, 'pending'),
(2, 'approved'),
(3, 'rejected')
ON CONFLICT (id) DO NOTHING;

-- 然后可以通过JOIN查询获取字符串状态