-- achievement_attachments 表测试数据
-- 用于测试成果附件的预览和下载功能
-- 创建时间：2025-12-04

-- 注意：在插入数据前，请确保以下条件已满足：
-- 1. achievement_attachments 存储桶已创建
-- 2. achievements 表中存在对应的成果记录
-- 3. achievement_attachments 表结构已创建

-- 清理现有测试数据（可选）
-- DELETE FROM achievement_attachments WHERE file_name LIKE '%test%' OR id LIKE '550e8400%';

-- 插入测试数据
INSERT INTO achievement_attachments (
    id,
    achievements_id,
    file_name,
    file_url,
    file_size,
    file_type,
    mime_type,
    created_at,
    updated_at
) VALUES
-- 成果"星露谷物语"(ID: 139f7afb-3c64-4837-ad67-d57422127eb6)的附件
('550e8400-e29b-41d4-a716-446655440001', '139f7afb-3c64-4837-ad67-d57422127eb6', '游戏截图1.png', 
 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement_attachments/achievements/139f7afb-3c64-4837-ad67-d57422127eb6/game_screenshot1.png', 
 245760, 'image', 'image/png', '2025-11-29 01:55:12.562+00', '2025-11-29 01:55:12.562+00'),

('550e8400-e29b-41d4-a716-446655440002', '139f7afb-3c64-4837-ad67-d57422127eb6', '游戏说明文档.pdf', 
 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement_attachments/achievements/139f7afb-3c64-4837-ad67-d57422127eb6/game_manual.pdf', 
 1048576, 'document', 'application/pdf', '2025-11-29 01:55:12.562+00', '2025-11-29 01:55:12.562+00'),

-- 成果"22222"(ID: c0e90ff6-f4d5-4607-a800-c8865b435901)的附件  
('550e8400-e29b-41d4-a716-446655440003', 'c0e90ff6-f4d5-4607-a800-c8865b435901', '项目报告.docx', 
 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement_attachments/achievements/c0e90ff6-f4d5-4607-a800-c8865b435901/project_report.docx', 
 524288, 'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-12-04 00:36:58.371+00', '2025-12-04 00:36:58.371+00'),

('550e8400-e29b-41d4-a716-446655440004', 'c0e90ff6-f4d5-4607-a800-c8865b435901', '演示视频.mp4', 
 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement_attachments/achievements/c0e90ff6-f4d5-4607-a800-c8865b435901/demo_video.mp4', 
 20971520, 'video', 'video/mp4', '2025-12-04 00:36:58.371+00', '2025-12-04 00:36:58.371+00'),

-- 成果"1"(ID: 4e3e9ecc-4f35-4ca0-93d2-c486686ccf23)的附件
('550e8400-e29b-41d4-a716-446655440005', '4e3e9ecc-4f35-4ca0-93d2-c486686ccf23', '设计方案.pdf', 
 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement_attachments/achievements/4e3e9ecc-4f35-4ca0-93d2-c486686ccf23/design_schema.pdf', 
 786432, 'document', 'application/pdf', '2025-12-04 00:54:18.229+00', '2025-12-04 00:54:18.229+00');

-- 验证插入结果
SELECT 
    'Test Data Summary' as info_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT achievements_id) as unique_achievements,
    SUM(file_size) as total_size_bytes,
    ROUND(SUM(file_size) / 1024 / 1024, 2) as total_size_mb,
    COUNT(CASE WHEN file_type = 'image' THEN 1 END) as image_count,
    COUNT(CASE WHEN file_type = 'video' THEN 1 END) as video_count,
    COUNT(CASE WHEN file_type = 'document' THEN 1 END) as document_count
FROM achievement_attachments 
WHERE id LIKE '550e8400%';

-- 查看插入的详细数据
SELECT 
    'Test Data Details' as section,
    id,
    achievements_id,
    file_name,
    file_type,
    mime_type,
    CASE 
        WHEN file_size < 1024 THEN file_size || ' B'
        WHEN file_size < 1024*1024 THEN ROUND(file_size/1024) || ' KB'
        WHEN file_size < 1024*1024*1024 THEN ROUND(file_size/(1024*1024), 1) || ' MB'
        ELSE ROUND(file_size/(1024*1024*1024), 2) || ' GB'
    END as display_size,
    created_at
FROM achievement_attachments 
WHERE id LIKE '550e8400%'
ORDER BY achievements_id, file_name;

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '===== ACHIEVEMENT_ATTACHMENTS 测试数据插入完成 =====';
    RAISE NOTICE '✅ 已插入 % 条测试记录', (SELECT COUNT(*) FROM achievement_attachments WHERE id LIKE '550e8400%');
    RAISE NOTICE '✅ 包含 % 个不同成果的附件', (SELECT COUNT(DISTINCT achievements_id) FROM achievement_attachments WHERE id LIKE '550e8400%');
    RAISE NOTICE '✅ 文件类型分布：图片 % 个，视频 % 个，文档 % 个', 
        (SELECT COUNT(*) FROM achievement_attachments WHERE id LIKE '550e8400%' AND file_type = 'image'),
        (SELECT COUNT(*) FROM achievement_attachments WHERE id LIKE '550e8400%' AND file_type = 'video'),
        (SELECT COUNT(*) FROM achievement_attachments WHERE id LIKE '550e8400%' AND file_type = 'document');
    RAISE NOTICE '==================================================';
END $$;

/*
测试数据说明：

1. 成果"星露谷物语" (139f7afb-3c64-4837-ad67-d57422127eb6)
   - 游戏截图1.png (240KB, 图片)
   - 游戏说明文档.pdf (1MB, 文档)

2. 成果"22222" (c0e90ff6-f4d5-4607-a800-c8865b435901)  
   - 项目报告.docx (512KB, 文档)
   - 演示视频.mp4 (20MB, 视频)

3. 成果"1" (4e3e9ecc-4f35-4ca0-93d2-c486686ccf23)
   - 设计方案.pdf (768KB, 文档)

文件URL格式已统一为：
https://your-project.supabase.co/storage/v1/object/public/achievement_attachments/achievements/{achievement_id}/{file_name}

测试用途：
- 验证附件预览功能（图片、视频、PDF）
- 测试文件下载功能
- 检查附件列表显示
- 验证文件大小和类型识别
- 测试附件与成果的关联关系
*/