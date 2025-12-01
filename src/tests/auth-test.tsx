import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// 测试组件
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-info">{user ? user.username : 'No User'}</div>
      <button onClick={() => login({ id: '1', username: 'testuser', email: 'test@example.com', role: 1, password_hash: '', created_at: '', updated_at: '' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  test('should handle login and logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 初始状态应该是未认证
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');

    // 点击登录按钮
    fireEvent.click(screen.getByText('Login'));

    // 检查是否已认证
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');

    // 点击登出按钮
    fireEvent.click(screen.getByText('Logout'));

    // 检查是否已登出
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
  });
});