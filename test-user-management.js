// 测试用户管理页面功能
// 这个脚本用于验证数据库连接和数据

const { createClient } = require('@supabase/supabase-js');

// Supabase配置（需要根据实际配置修改）
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserManagement() {
  console.log('🔍 测试用户管理页面功能...\n');

  try {
    // 测试获取年级
    console.log('📚 测试获取年级...');
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .limit(5);
    
    if (gradesError) {
      console.error('❌ 获取年级失败:', gradesError);
    } else {
      console.log('✅ 年级数据:', grades);
    }

    // 测试获取班级
    console.log('\n🏫 测试获取班级...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(`
        *,
        grades (name)
      `)
      .limit(5);
    
    if (classesError) {
      console.error('❌ 获取班级失败:', classesError);
    } else {
      console.log('✅ 班级数据:', classes);
    }

    // 测试获取用户
    console.log('\n👥 测试获取用户...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('❌ 获取用户失败:', usersError);
    } else {
      console.log('✅ 用户数据:', users);
    }

    // 测试搜索功能
    console.log('\n🔍 测试搜索功能...');
    const { data: searchResults, error: searchError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 2) // 搜索教师
      .limit(3);
    
    if (searchError) {
      console.error('❌ 搜索失败:', searchError);
    } else {
      console.log('✅ 搜索结果(教师):', searchResults);
    }

    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 导出函数以供使用
module.exports = { testUserManagement };

// 如果直接运行此脚本
if (require.main === module) {
  testUserManagement();
}