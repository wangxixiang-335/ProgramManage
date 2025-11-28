

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../lib/authService';
import styles from './styles.module.css';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type PortType = 'student' | 'teacher' | 'admin';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 表单数据状态
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 表单错误状态
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState('注册失败，请稍后再试');
  const [showRegisterError, setShowRegisterError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [currentPort, setCurrentPort] = useState<PortType>('student');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 注册';
    return () => { document.title = originalTitle; };
  }, []);

  // 邮箱验证函数
  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // 密码验证函数
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // 清除注册错误
  const clearRegisterError = () => {
    setShowRegisterError(false);
    setIsShaking(false);
  };

  // 显示注册错误
  const showRegisterErrorMessage = (message: string) => {
    setRegisterErrorMessage(message);
    setShowRegisterError(true);
    setIsShaking(true);
    
    // 移除抖动类
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  // 输入框变化处理
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    clearRegisterError();
  };

  // 输入框失焦验证
  const handleInputBlur = (field: keyof FormData) => {
    const value = formData[field];
    let error = '';

    switch (field) {
      case 'username':
        if (!value.trim()) {
          error = '请输入用户名';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = '请输入邮箱';
        } else if (!validateEmail(value.trim())) {
          error = '请输入有效的邮箱地址';
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = '请输入密码';
        } else if (!validatePassword(value.trim())) {
          error = '密码至少包含8个字符';
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          error = '请确认密码';
        } else if (value.trim() !== formData.password.trim()) {
          error = '两次输入的密码不一致';
        }
        break;
    }

    setFormErrors(prev => ({ ...prev, [field]: error }));
    clearRegisterError();
  };

  // 端口切换处理
  const handlePortSwitch = (port: PortType) => {
    setCurrentPort(port);
    clearRegisterError();
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    clearRegisterError();
    
    // 验证所有字段
    const newErrors: FormErrors = {
      username: !formData.username.trim() ? '请输入用户名' : '',
      email: !formData.email.trim() ? '请输入邮箱' : !validateEmail(formData.email.trim()) ? '请输入有效的邮箱地址' : '',
      password: !formData.password.trim() ? '请输入密码' : !validatePassword(formData.password.trim()) ? '密码至少包含8个字符' : '',
      confirmPassword: !formData.confirmPassword.trim() ? '请确认密码' : formData.confirmPassword.trim() !== formData.password.trim() ? '两次输入的密码不一致' : ''
    };

    setFormErrors(newErrors);

    // 检查是否有错误
    const hasErrors = Object.values(newErrors).some(error => error);
    if (hasErrors) {
      return;
    }

    // 设置注册状态
    setIsRegistering(true);

    try {
      // 调用注册服务
      const result = await AuthService.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: AuthService.getRoleId(currentPort)
      });

      if (result.success) {
        // 注册成功，显示成功消息并跳转到登录页
        alert('注册成功！请登录您的账号');
        navigate('/login');
      } else {
        // 注册失败，显示错误消息
        showRegisterErrorMessage(result.message);
      }
      
    } catch (error) {
      showRegisterErrorMessage('注册失败，请稍后再试');
    } finally {
      setIsRegistering(false);
    }
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isRegistering) {
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData, isRegistering]);

  // 获取当前主题的样式类
  const getThemeClasses = () => {
    const baseClasses = `${styles.pageWrapper} ${currentPort === 'teacher' ? styles.blueTheme : ''} ${currentPort === 'admin' ? styles.greenTheme : ''}`;
    return baseClasses;
  };

  // 获取当前主题的颜色类
  const getThemeColor = () => {
    if (currentPort === 'teacher') return 'blue-500';
    if (currentPort === 'admin') return 'green-500';
    return 'orange-500';
  };

  const getThemeHoverColor = () => {
    if (currentPort === 'teacher') return 'blue-700';
    if (currentPort === 'admin') return 'green-700';
    return 'orange-700';
  };

  const getPortHoverColor = (port: PortType) => {
    if (port === 'student') return 'hover:bg-orange-100';
    if (port === 'teacher') return 'hover:bg-blue-100';
    return 'hover:bg-green-100';
  };

  return (
    <div className={getThemeClasses()}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-secondary bg-opacity-10 rounded-full blur-xl"></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 bg-${getThemeColor()} bg-opacity-10 rounded-full blur-xl`}></div>
        <div className={`absolute top-1/2 left-1/4 w-24 h-24 bg-${getThemeColor()} bg-opacity-5 rounded-full blur-lg`}></div>
      </div>

      {/* 注册容器 */}
      <div className="relative w-full max-w-md">
        {/* 注册卡片 */}
        <div className={`bg-bg-light rounded-2xl shadow-login p-8 ${styles.fadeIn} ${isShaking ? styles.errorShake : ''}`}>
          {/* 端口切换 */}
          <div className="flex justify-center mb-6">
            <div className="bg-bg-gray rounded-full p-1 flex">
              <button 
                onClick={() => handlePortSwitch('student')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPort === 'student' 
                    ? 'bg-orange-500 text-white' 
                    : `text-text-secondary ${getPortHoverColor('student')}`
                }`}
              >
                学生端
              </button>
              <button 
                onClick={() => handlePortSwitch('teacher')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPort === 'teacher' 
                    ? 'bg-blue-500 text-white' 
                    : `text-text-secondary ${getPortHoverColor('teacher')}`
                }`}
              >
                教师端
              </button>
              <button 
                onClick={() => handlePortSwitch('admin')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentPort === 'admin' 
                    ? 'bg-green-500 text-white' 
                    : `text-text-secondary ${getPortHoverColor('admin')}`
                }`}
              >
                管理员端
              </button>
            </div>
          </div>
          
          {/* Logo区域 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`w-16 h-16 bg-${getThemeColor()} rounded-xl flex items-center justify-center`}>
                <i className="fas fa-graduation-cap text-white text-2xl"></i>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-text-primary">河北师范大学</h1>
                <p className="text-sm text-text-muted">软件学院</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">软院项目通</h2>
            <p className="text-text-muted">创建新账号</p>
          </div>

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-text-primary">
                <i className={`fas fa-user mr-2 text-${getThemeColor()}`}></i>用户名
              </label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleInputBlur('username')}
                className={`w-full px-4 py-3 border rounded-lg ${styles.loginInputFocus} bg-white text-text-primary placeholder-text-muted ${
                  formErrors.username ? 'border-red-300' : 'border-border-light'
                }`}
                placeholder="请设置用户名"
                required
                autoComplete="username"
              />
              {formErrors.username && (
                <div className="text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  <span>{formErrors.username}</span>
                </div>
              )}
            </div>

            {/* 邮箱输入 */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                <i className={`fas fa-envelope mr-2 text-${getThemeColor()}`}></i>邮箱
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={`w-full px-4 py-3 border rounded-lg ${styles.loginInputFocus} bg-white text-text-primary placeholder-text-muted ${
                  formErrors.email ? 'border-red-300' : 'border-border-light'
                }`}
                placeholder="请输入邮箱"
                required
                autoComplete="email"
              />
              {formErrors.email && (
                <div className="text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  <span>{formErrors.email}</span>
                </div>
              )}
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                <i className={`fas fa-lock mr-2 text-${getThemeColor()}`}></i>密码
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg ${styles.loginInputFocus} bg-white text-text-primary placeholder-text-muted ${
                    formErrors.password ? 'border-red-300' : 'border-border-light'
                  }`}
                  placeholder="请设置密码"
                  required
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.password && (
                <div className="text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  <span>{formErrors.password}</span>
                </div>
              )}
            </div>

            {/* 确认密码输入 */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary">
                <i className={`fas fa-lock mr-2 text-${getThemeColor()}`}></i>确认密码
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password" 
                  name="confirm-password" 
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleInputBlur('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg ${styles.loginInputFocus} bg-white text-text-primary placeholder-text-muted ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-border-light'
                  }`}
                  placeholder="请再次输入密码"
                  required
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.confirmPassword && (
                <div className="text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  <span>{formErrors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {showRegisterError && (
              <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <span className="text-red-700 text-sm">{registerErrorMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 注册按钮 */}
            <button 
              type="submit" 
              disabled={isRegistering}
              className={`w-full py-3 bg-${getThemeColor()} text-white font-medium rounded-lg ${styles.loginButtonHover} ${styles.loginButtonActive} transition-all duration-300 flex items-center justify-center ${
                isRegistering ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <i className="fas fa-user-plus mr-2"></i>
              <span>{isRegistering ? '注册中...' : '注册'}</span>
              {isRegistering && (
                <i className="fas fa-spinner fa-spin ml-2"></i>
              )}
            </button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              已有账号？
              <Link 
                to="/login" 
                className={`text-${getThemeColor()} hover:text-${getThemeHoverColor()} transition-colors`}
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8">
          <p className="text-text-muted text-sm">
            © 2024 河北师范大学软件学院
          </p>
          <p className="text-text-muted text-xs mt-1">
            软院项目通 v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

