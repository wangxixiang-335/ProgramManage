import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../lib/authService';

const AuthValidation: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAuthSystem = async () => {
    addResult('开始认证系统测试...');
    
    // 测试1: 检查初始状态
    addResult(`初始认证状态: ${isAuthenticated ? '已认证' : '未认证'}`);
    addResult(`当前用户: ${user?.username || '无用户'}`);
    
    // 测试2: 模拟登录
    addResult('测试登录功能...');
    const loginResult = await AuthService.login({
      email: 'test@example.com',
      password: 'test123'
    });
    
    if (loginResult.success && loginResult.user) {
      addResult(`登录成功: ${loginResult.user.username} (${loginResult.user.id})`);
      login(loginResult.user);
      
      // 测试3: 检查登录后的状态
      setTimeout(() => {
        addResult(`登录后认证状态: ${isAuthenticated ? '已认证' : '未认证'}`);
        addResult(`登录后用户: ${user?.username || '仍然无用户'}`);
        addResult(`localStorage用户: ${JSON.parse(localStorage.getItem('currentUser') || '{}')?.username || '无'}`);
      }, 1000);
    } else {
      addResult(`登录失败: ${loginResult.message}`);
    }
  };

  useEffect(() => {
    console.log('AuthValidation mounted - 当前用户:', user);
    console.log('localStorage当前内容:', localStorage.getItem('currentUser'));
  }, []);

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-y-auto shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">认证系统测试</h3>
        <button 
          onClick={testAuthSystem}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          运行测试
        </button>
      </div>
      <div className="space-y-1 text-xs">
        {testResults.map((result, index) => (
          <div key={index} className="font-mono text-gray-700">
            {result}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs font-semibold mb-1">当前状态:</div>
        <div className="text-xs">
          认证: {isAuthenticated ? '✅ 已认证' : '❌ 未认证'}<br/>
          用户: {user?.username || '无用户'}<br/>
          ID: {user?.id?.substring(0, 8) || '无'}...<br/>
          角色: {user?.role === 1 ? '学生' : user?.role === 2 ? '教师' : user?.role === 3 ? '管理员' : '未知'}
        </div>
      </div>
    </div>
  );
};

export default AuthValidation;