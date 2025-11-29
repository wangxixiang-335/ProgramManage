// 成果发布功能测试脚本

import {
  saveDraft,
  publishAchievement,
  getAchievementTypes,
  getApprovers,
  AchievementData,
  AchievementType
} from '../services/achievementService';

// 测试数据
const testAchievementData: AchievementData = {
  title: '测试成果发布',
  description: '这是一个测试成果的描述',
  type_id: '', // 需要从achievement_types获取
  cover_url: 'https://example.com/cover.jpg',
  partners: ['张三', '李四'],
  instructors: ['王教授'],
  content: '<h2>测试内容</h2><p>这是测试的详细内容...</p>',
  video_url: 'https://example.com/demo.mp4',
  attachments: ['https://example.com/file1.pdf'],
  status: 'draft',
  creator_id: 'test-user-id'
};

// 测试函数
export const testAchievementPublish = async () => {
  console.log('🚀 开始测试成果发布功能...');

  try {
    // 1. 测试获取成果类型
    console.log('📋 获取成果类型...');
    const types = await getAchievementTypes();
    console.log('✅ 成果类型:', types);
    
    if (types.length > 0) {
      testAchievementData.type_id = types[0].id;
      console.log(`📝 选择第一个类型: ${types[0].name} (${types[0].id})`);
    }

    // 2. 测试获取审批人
    console.log('👥 获取审批人列表...');
    const approvers = await getApprovers();
    console.log('✅ 审批人列表:', approvers);

    // 3. 测试保存草稿
    console.log('💾 保存草稿...');
    const draftResult = await saveDraft(testAchievementData);
    console.log('✅ 草稿保存结果:', draftResult);

    // 4. 测试发布成果
    if (approvers.length > 0) {
      console.log('📤 发布成果...');
      const publishResult = await publishAchievement(testAchievementData, [approvers[0].id]);
      console.log('✅ 成果发布结果:', publishResult);
    }

    console.log('🎉 成果发布功能测试完成！');
    return true;

  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
};

// 在控制台运行测试
if (typeof window !== 'undefined') {
  (window as any).testAchievementPublish = testAchievementPublish;
  console.log('💡 在控制台运行 testAchievementPublish() 来测试功能');
}