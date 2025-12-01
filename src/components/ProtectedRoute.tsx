import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 检查是否已登录
  if (!isAuthenticated) {
    // 保存原始路径以便登录后重定向
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查角色权限
  if (requiredRole && user?.role !== requiredRole) {
    // 根据用户角色重定向到对应首页
    const roleHomeRoute = user.role === 1 ? '/home' : user.role === 2 ? '/teacher-home' : '/admin-home';
    return <Navigate to={roleHomeRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;