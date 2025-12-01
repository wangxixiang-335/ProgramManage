import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
        <strong>未登录</strong>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
      <div><strong>已登录:</strong> {user?.username}</div>
      <div><strong>角色:</strong> {user?.role === 1 ? '学生' : user?.role === 2 ? '教师' : '管理员'}</div>
      <div><strong>ID:</strong> {user?.id?.substring(0, 8)}...</div>
    </div>
  );
};

export default AuthDebug;