import { supabase } from '../lib/supabase';

// 测试数据库连接和表结构
async function testDatabaseConnection() {
  console.log('Testing Supabase database connection...');
  
  try {
    // 1. 测试基本连接
    const { data, error } = await supabase
      .from('achievements')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // 2. 测试获取表结构
    const { data: tableInfo, error: tableError } = await supabase
      .from('achievements')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('Failed to access achievements table:', tableError);
      return false;
    }
    
    console.log('✅ Achievements table accessible');
    
    // 3. 测试获取users表
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .limit(5);
    
    if (usersError) {
      console.error('Failed to access users table:', usersError);
      return false;
    }
    
    console.log('✅ Users table accessible, found users:', users?.length || 0);
    
    // 4. 测试获取achievement_types表
    const { data: types, error: typesError } = await supabase
      .from('achievement_types')
      .select('*')
      .limit(10);
    
    if (typesError) {
      console.warn('achievement_types table not accessible, will use fallback data:', typesError.message);
    } else {
      console.log('✅ Achievement types table accessible, found types:', types?.length || 0);
    }
    
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

// 测试成果创建
async function testAchievementCreation() {
  console.log('Testing achievement creation...');
  
  const testAchievement = {
    title: 'Test Achievement ' + Date.now(),
    description: 'This is a test achievement created to verify the publishing functionality.',
    type_id: '3582cb28-b452-4495-bd5c-85ea0a2a575f', // 网站开发类型ID
    cover_url: 'https://example.com/cover.jpg',
    video_url: '',
    publisher_id: '72ee2ee4-b41a-4389-a6a0-e2b59fb5980b', // 测试学生ID
    instructor_id: '7a482e3f-93c3-467c-9f4a-7fea2084b093', // 测试教师ID
    parents_id: null
  };
  
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([testAchievement])
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create test achievement:', error);
      return false;
    }
    
    console.log('✅ Test achievement created successfully:', data.id);
    
    // 清理测试数据
    await supabase
      .from('achievements')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test data cleaned up');
    return true;
  } catch (error) {
    console.error('Achievement creation test failed:', error);
    return false;
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 Starting database and achievement publishing tests...');
  
  const connectionOk = await testDatabaseConnection();
  const creationOk = await testAchievementCreation();
  
  if (connectionOk && creationOk) {
    console.log('🎉 All tests passed! Achievement publishing should work correctly.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please check the database configuration.');
    return false;
  }
}

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
  // 在浏览器环境中，将函数添加到全局对象
  window.testDatabase = runAllTests;
  console.log('Run window.testDatabase() to test database connectivity');
}