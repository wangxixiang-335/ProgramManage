

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../lib/authService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

type RoleType = 'student' | 'teacher' | 'admin';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
  login: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // 表单数据状态
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  // 表单错误状态
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: '',
    login: ''
  });

  // UI状态
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleType>('student');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 登录';
    return () => { document.title = originalTitle; };
  }, []);

  // 自动聚焦到邮箱输入框
  useEffect(() => {
    const timer = setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 邮箱验证函数
  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // 清除表单错误
  const clearFormErrors = () => {
    setFormErrors({
      email: '',
      password: '',
      login: ''
    });
    setIsShaking(false);
  };

  // 显示登录错误
  const showLoginError = (message: string) => {
    setFormErrors(prev => ({ ...prev, login: message }));
    setIsShaking(true);
    
    // 移除抖动类
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  // 处理输入框变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 实时验证
    if (field === 'email' && value.trim() && validateEmail(value.trim())) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
    if (field === 'password' && value.trim()) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
    
    clearFormErrors();
  };

  // 处理输入框失焦验证
  const handleInputBlur = (field: keyof FormData) => {
    const value = formData[field];
    
    if (!value.trim()) {
      setFormErrors(prev => ({ 
        ...prev, 
        [field]: field === 'email' ? '请输入邮箱' : '请输入密码' 
      }));
    } else if (field === 'email' && !validateEmail(value.trim())) {
      setFormErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    clearFormErrors();
  };

  // 切换密码可见性
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误
    clearFormErrors();
    
    // 验证邮箱
    let isEmailValid = true;
    if (!formData.email.trim()) {
      setFormErrors(prev => ({ ...prev, email: '请输入邮箱' }));
      isEmailValid = false;
    } else if (!validateEmail(formData.email.trim())) {
      setFormErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
      isEmailValid = false;
    }
    
    // 验证密码
    const isPasswordValid = formData.password.trim() !== '';
    if (!isPasswordValid) {
      setFormErrors(prev => ({ ...prev, password: '请输入密码' }));
    }
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    // 设置加载状态
    setIsLoading(true);
    
    try {
      // 调用登录服务
      const result = await AuthService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success && result.user) {
        // 检查用户角色是否与当前选择的角色匹配
        const expectedRoleId = AuthService.getRoleId(currentRole);
        if (result.user.role !== expectedRoleId) {
          showLoginError(`该账号是${AuthService.getRoleName(result.user.role) === 'student' ? '学生端' : AuthService.getRoleName(result.user.role) === 'teacher' ? '教师端' : '管理员端'}账号，请选择正确的角色登录`);
          return;
        }

        // 登录成功，保存用户会话
        login(result.user);
        
        // 跳转到对应的首页
        const homeRoute = AuthService.getRoleHomeRoute(result.user.role);
        navigate(homeRoute);
      } else {
        // 登录失败，显示错误消息
        showLoginError(result.message);
      }
      
    } catch (error) {
      showLoginError('登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理角色切换
  const handleRoleChange = (role: RoleType) => {
    setCurrentRole(role);
    clearFormErrors();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleFormSubmit(e as any);
    }
  };

  // 获取当前模式的CSS类名
  const getModeClassNames = () => {
    if (currentRole === 'teacher') return styles.teacherMode;
    if (currentRole === 'admin') return styles.adminMode;
    return styles.studentMode;
  };

  // 获取当前角色的次要颜色类名
  const getSecondaryColorClass = () => {
    if (currentRole === 'teacher') return styles.bgSecondary;
    if (currentRole === 'admin') return styles.bgSecondary;
    return styles.bgSecondary;
  };

  // 获取当前角色的文本次要颜色类名
  const getTextSecondaryColorClass = () => {
    if (currentRole === 'teacher') return styles.textSecondary;
    if (currentRole === 'admin') return styles.textSecondary;
    return styles.textSecondary;
  };

  // 获取当前角色的边框次要颜色类名
  const getBorderSecondaryColorClass = () => {
    if (currentRole === 'teacher') return styles.borderSecondary;
    if (currentRole === 'admin') return styles.borderSecondary;
    return styles.borderSecondary;
  };

  // 获取当前角色的悬停文本强调色类名
  const getHoverTextAccentClass = () => {
    if (currentRole === 'teacher') return styles.hoverTextAccent;
    if (currentRole === 'admin') return styles.hoverTextAccent;
    return styles.hoverTextAccent;
  };

  return (
    <div className={`${styles.pageWrapper} ${getModeClassNames()}`} onKeyDown={handleKeyDown}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-32 h-32 ${getSecondaryColorClass()} bg-opacity-10 rounded-full blur-xl`}></div>
        <div className={`absolute bottom-20 right-20 w-40 h-40 ${getSecondaryColorClass()} bg-opacity-10 rounded-full blur-xl`}></div>
        <div className={`absolute top-1/2 left-1/4 w-24 h-24 ${getSecondaryColorClass()} bg-opacity-5 rounded-full blur-lg`}></div>
      </div>

      {/* 登录容器 */}
      <div className="relative w-full max-w-md">
        {/* 角色切换器 */}
        <div className="mb-6 bg-bg-light rounded-xl shadow-card p-1 flex">
<button 
            onClick={() => handleRoleChange('student')}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
              currentRole === 'student' 
                ? 'bg-orange-500 text-white' 
                : 'bg-transparent text-text-secondary'
            }`}
          >
            <i className="fas fa-user-graduate mr-2"></i>学生端
          </button>
          <button 
            onClick={() => handleRoleChange('teacher')}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
              currentRole === 'teacher' 
                ? 'bg-secondary text-white' 
                : 'bg-transparent text-text-secondary'
            }`}
          >
            <i className="fas fa-chalkboard-teacher mr-2"></i>教师端
          </button>
          <button 
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
              currentRole === 'admin' 
                ? 'bg-green-600 text-white' 
                : 'bg-transparent text-text-secondary'
            }`}
          >
            <i className="fas fa-user-shield mr-2"></i>管理员端
          </button>
        </div>
        
        {/* 登录卡片 */}
        <div className={`bg-bg-light rounded-2xl shadow-login p-8 ${styles.fadeIn} ${isShaking ? styles.errorShake : ''}`}>
          {/* Logo区域 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`w-16 h-16 ${getSecondaryColorClass()} rounded-xl flex items-center justify-center`}>
                <i className="fas fa-graduation-cap text-white text-2xl"></i>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-text-primary">河北师范大学</h1>
                <p className="text-sm text-text-muted">软件学院</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">软院项目通</h2>
            <p className="text-text-muted">欢迎登录项目管理平台</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                <i className={`fas fa-envelope mr-2 ${getTextSecondaryColorClass()}`}></i>邮箱
              </label>
              <input 
                ref={emailInputRef}
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                className={`w-full px-4 py-3 border rounded-lg bg-white text-text-primary placeholder-text-muted ${styles.loginInputFocus} ${
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
                <i className={`fas fa-lock mr-2 ${getTextSecondaryColorClass()}`}></i>密码
              </label>
              <div className="relative">
                <input 
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleInputBlur('password')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white text-text-primary placeholder-text-muted ${styles.loginInputFocus} ${
                    formErrors.password ? 'border-red-300' : 'border-border-light'
                  }`}
                  placeholder="请输入密码"
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <i className={`fas ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formErrors.password && (
                <div className="text-sm text-red-500">
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  <span>{formErrors.password}</span>
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {formErrors.login && (
              <div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <span className="text-red-700 text-sm">{formErrors.login}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 ${getSecondaryColorClass()} text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center ${styles.loginButtonHover} ${styles.loginButtonActive} ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              <span>{isLoading ? '登录中...' : '登录'}</span>
              {isLoading && (
                <i className="fas fa-spinner fa-spin ml-2"></i>
              )}
            </button>
          </form>

          {/* 忘记密码链接 */}
          <div className="mt-6 text-center">
            <Link 
              to="/forgot-password" 
              className={`text-sm ${getTextSecondaryColorClass()} ${getHoverTextAccentClass()} transition-colors`}
            >
              <i className="fas fa-question-circle mr-1"></i>
              忘记密码？
            </Link>
          </div>
          
          {/* 注册链接 */}
          <div className="mt-4 text-center">
            <p className="text-sm text-text-secondary">
              还没有账号？
              <Link 
                to="/register" 
                className={`${getTextSecondaryColorClass()} ${getHoverTextAccentClass()} transition-colors ml-1`}
              >
                立即注册
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

export default LoginPage;

