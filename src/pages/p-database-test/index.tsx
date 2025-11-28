import React, { useState } from 'react';
import styles from './styles.module.css';
import { supabase } from '../../lib/supabase';
import { runAllTests } from '../../test/achievement-database-test';

const DatabaseTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult('正在测试数据库连接...');
    
    try {
      // 测试基本连接
      const { data, error } = await supabase
        .from('achievements')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        setTestResult(`❌ 数据库连接失败: ${error.message}`);
        return;
      }
      
      setTestResult('✅ 数据库连接成功！');
      
      // 测试用户表
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, role')
        .limit(5);
      
      if (usersError) {
        setTestResult(prev => prev + '\n❌ 用户表访问失败: ' + usersError.message);
        return;
      }
      
      setTestResult(prev => prev + `\n✅ 用户表访问成功，找到 ${users?.length || 0} 个用户`);
      
      // 显示用户信息
      if (users && users.length > 0) {
        const userList = users.map(u => `- ${u.username} (ID: ${u.id}, Role: ${u.role})`).join('\n');
        setTestResult(prev => prev + '\n\n用户列表:\n' + userList);
      }
      
      // 测试成果类型表
      const { data: types, error: typesError } = await supabase
        .from('achievement_types')
        .select('*')
        .limit(10);
      
      if (typesError) {
        setTestResult(prev => prev + '\n⚠️ 成果类型表访问失败: ' + typesError.message + ' (将使用预定义数据)');
      } else {
        setTestResult(prev => prev + `\n✅ 成果类型表访问成功，找到 ${types?.length || 0} 个类型`);
        
        if (types && types.length > 0) {
          const typeList = types.map(t => `- ${t.name} (ID: ${t.id})`).join('\n');
          setTestResult(prev => prev + '\n\n成果类型列表:\n' + typeList);
        }
      }
      
      // 运行完整测试
      const fullTestResult = await runAllTests();
      setTestResult(prev => prev + '\n\n🎯 完整测试结果: ' + (fullTestResult ? '✅ 全部通过' : '❌ 部分失败'));
      
    } catch (error) {
      setTestResult(`❌ 测试过程中出现错误: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAchievementCreation = async () => {
    setIsLoading(true);
    setTestResult('正在测试成果创建...');
    
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
        .insert([{
          ...testAchievement,
          status: 'pending', // 新创建的成果默认为待审核状态
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        setTestResult(`❌ 成果创建失败: ${error.message}`);
        return;
      }
      
      setTestResult(`✅ 测试成果创建成功！\n\n成果信息:\n- ID: ${data.id}\n- 标题: ${data.title}\n- 状态: ${data.status}\n- 创建时间: ${data.created_at}`);
      
      // 询问是否清理测试数据
      setTimeout(() => {
        if (window.confirm('是否清理测试数据？')) {
          supabase
            .from('achievements')
            .delete()
            .eq('id', data.id)
            .then(() => {
              setTestResult(prev => prev + '\n\n🧹 测试数据已清理');
            });
        }
      }, 1000);
      
    } catch (error) {
      setTestResult(`❌ 成果创建测试失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">数据库连接测试</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试选项</h2>
          <div className="flex gap-4">
            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '测试中...' : '测试数据库连接'}
            </button>
            
            <button
              onClick={handleTestAchievementCreation}
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '测试中...' : '测试成果创建'}
            </button>
          </div>
        </div>
        
        {testResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseTestPage;