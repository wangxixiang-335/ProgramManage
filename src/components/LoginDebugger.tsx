import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('=== 认证状态调试信息 ===');
    console.log('是否已认证:', isAuthenticated);
    console.log('当前用户:', user);
    if (user) {
      console.log('用户ID:', user.id);
      console.log('用户名:', user.username);
      console.log('用户邮箱:', user.email);
      console.log('用户角色:', user.role);
    }
    console.log('localStorage中的用户:', localStorage.getItem('currentUser'));
    console.log('========================');
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-xs">
        <div><strong>🔴 未登录</strong></div>
        <div>localStorage: {localStorage.getItem('currentUser') ? '有数据' : '无数据'}</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-xs max-w-xs">
      <div><strong>🟢 已登录</strong></div>
      <div>用户: {user?.username}</div>
      <div>ID: {user?.id?.substring(0, 8)}...</div>
      <div>角色: {user?.role === 1 ? '学生' : user?.role === 2 ? '教师' : '管理员'}</div>
      <div>邮箱: {user?.email}</div>
    </div>
  );
};

export default LoginDebugger;