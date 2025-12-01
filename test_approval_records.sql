-- 测试审批记录功能
-- 这个文件可以用来测试approval_records表的结构和功能

-- 插入测试审批记录
INSERT INTO approval_records (
  id, 
  achievement_id, 
  reviewer_id, 
  status, 
  feedback, 
  reviewed_at
) VALUES (
  gen_random_uuid(),
  'test-achievement-id',
  'test-reviewer-id',
  0, -- 驳回状态
  '测试驳回原因',
  NOW()
);

-- 查询审批记录
SELECT * FROM approval_records WHERE achievement_id = 'test-achievement-id';

-- 清理测试数据
DELETE FROM approval_records WHERE achievement_id = 'test-achievement-id';