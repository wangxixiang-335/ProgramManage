-- 插入achievement_attachments表的测试数据
INSERT INTO achievement_attachments (
    id,
    achievements_id,
    file_name,
    file_url,
    file_size,
    created_at
) VALUES
-- 成果"星露谷物语"的附件
('550e8400-e29b-41d4-a716-446655440001', '139f7afb-3c64-4837-ad67-d57422127eb6', '游戏截图1.png', 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement-images/achievements/72ee2ee4-b41a-4389-a6a0-e2b59fb5980b/attachment_1.png', 245760,  '2025-11-29 01:55:12.562+00'),

('550e8400-e29b-41d4-a716-446655440002', '139f7afb-3c64-4837-ad67-d57422127eb6', '游戏说明文档.pdf', 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement-files/achievements/72ee2ee4-b41a-4389-a6a0-e2b59fb5980b/game_manual.pdf', 1048576,  '2025-11-29 01:55:12.562+00'),

-- 成果"22222"的附件  
('550e8400-e29b-41d4-a716-446655440003', 'c0e90ff6-f4d5-4607-a800-c8865b435901', '项目报告.docx', 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement-files/achievements/83de00f1-c7a2-42d8-a5e8-817b48668358/project_report.docx', 524288, '2025-12-04 00:36:58.371+00'),

('550e8400-e29b-41d4-a716-446655440004', 'c0e90ff6-f4d5-4607-a800-c8865b435901', '演示视频.mp4', 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement-videos/achievements/83de00f1-c7a2-42d8-a5e8-817b48668358/demo_video.mp4', 20971520, '2025-12-04 00:36:58.371+00'),

-- 成果"1"（第二个）的附件
('550e8400-e29b-41d4-a716-446655440005', '4e3e9ecc-4f35-4ca0-93d2-c486686ccf23', '设计方案.pdf', 'https://vntvrdkjtfdcnvwgrubo.supabase.co/storage/v1/object/public/achievement-files/achievements/83de00f1-c7a2-42d8-a5e8-817b48668358/design_schema.pdf', 786432, '2025-12-04 00:54:18.229+00');