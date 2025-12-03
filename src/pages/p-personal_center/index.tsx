

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUsers, getAllClassesForSwitchFallback } from '../../services/supabaseUserService';
import styles from './styles.module.css';

interface UserInfo {
  name: string;
  grade: string;
  className: string;
  email: string;
  avatarUrl?: string;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: number;
  class_id?: string;
  created_at: string;
  updated_at: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade_id: string;
  grades?: {
    id: string;
    name: string;
  };
}

interface Notification {
  id: string;
  type: string;
  content: string;
  time: string;
  iconColor: string;
}



const PersonalCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '用户',
    grade: '未分配年级',
    className: '',
    email: '',
    avatarUrl: 'https://s.coze.cn/image/cqWetb7C3JE/'
  });
  const [originalUserInfo, setOriginalUserInfo] = useState<UserInfo>(userInfo);
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);

  

  // 获取所有班级和年级数据
  const fetchClassesAndGrades = async () => {
    try {
      // 获取所有年级
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('*')
        .order('name', { ascending: false });

      if (gradesError) {
        console.error('获取年级数据失败:', gradesError);
        return;
      }

      setGrades(gradesData || []);
      console.log('获取到的年级数据:', gradesData);

      // 获取所有班级（基础查询，不包含关联）
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name, grade_id')
        .order('name', { ascending: true });

      if (classesError) {
        console.error('获取班级数据失败:', classesError);
        console.error('错误详情:', JSON.stringify(classesError, null, 2));
        return;
      }

      console.log('基础班级数据获取成功:', classesData);

      // 手动关联年级数据
      const classesWithGrades = classesData?.map(cls => {
        const grade = gradesData?.find(g => g.id === cls.grade_id);
        return {
          ...cls,
          grades: grade ? { name: grade.name } : null
        };
      });

      console.log('关联后的班级数据:', classesWithGrades);

      setClasses(classesWithGrades || []);
      console.log('设置班级数据完成:', classesWithGrades);
    } catch (error) {
      console.error('获取班级年级数据失败:', error);
    }
  };

  // 获取用户通知

  // 获取用户通知
  const fetchUserNotifications = async () => {
    if (!user?.id) return;
    
    try {
      // 获取系统通知（这里使用模拟数据，实际项目中应该有通知表）
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: '系统通知',
          content: '欢迎使用软院项目通系统，请及时完善个人信息。',
          time: new Date().toLocaleString('zh-CN'),
          iconColor: 'bg-secondary'
        },
        {
          id: '2',
          type: '系统提醒',
          content: '请定期更新个人信息，保持资料的最新状态。',
          time: new Date(Date.now() - 86400000).toLocaleString('zh-CN'),
          iconColor: 'bg-accent'
        }
      ];
      
      setUserNotifications(mockNotifications);
    } catch (error) {
      console.error('获取用户通知失败:', error);
    }
  };

  // 获取用户详细信息
  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // 获取用户基本信息
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('获取用户信息失败:', userError);
        return;
      }

      if (userData) {
        setUserProfile(userData);
        
        // 获取班级和年级信息
        let className = '';
        let gradeName = '未分配年级';
        
        if (userData.class_id) {
          // 先获取班级基础数据
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('id, name, grade_id')
            .eq('id', userData.class_id)
            .single();

          if (!classError && classData) {
            className = classData.name;
            
            // 再获取对应的年级信息
            if (classData.grade_id) {
              const { data: gradeData, error: gradeError } = await supabase
                .from('grades')
                .select('name')
                .eq('id', classData.grade_id)
                .single();
              
              if (!gradeError && gradeData) {
                gradeName = gradeData.name;
              }
            }
          }
        }

        // 更新用户信息状态
        const newUserInfo: UserInfo = {
          name: userData.full_name || userData.username || '用户',
          grade: gradeName,
          className: className || '未分配班级',
          email: userData.email || '',
          avatarUrl: userData.avatar_url || 'https://s.coze.cn/image/cqWetb7C3JE/'
        };
        
        console.log('加载用户信息完成:', {
          userData,
          className,
          gradeName,
          newUserInfo
        });
        
        setUserInfo(newUserInfo);
        setOriginalUserInfo(newUserInfo);
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
    } finally {
      setLoading(false);
    }
    
    // 获取所有班级和年级数据
      try {
        await Promise.all([
          fetchUserNotifications(),
          fetchClassesAndGrades()
        ]);
      } catch (error) {
        console.error('获取附加数据失败:', error);
      }
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 个人中心';
    
    // 获取用户数据
    fetchUserProfile();
    
    return () => { document.title = originalTitle; };
  }, [user?.id]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/project-intro?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleEditToggle = () => {
    if (!isEditMode) {
      setOriginalUserInfo(userInfo);
    } else {
      setUserInfo(originalUserInfo);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveEdit = async () => {
    if (!userProfile) return;
    
    try {
      // 查找对应的班级ID
      let classId = null;
      console.log('保存用户信息，当前班级名称:', userInfo.className);
      if (userInfo.className && userInfo.className !== '未分配班级' && userInfo.className !== '') {
        const selectedClass = classes.find(cls => cls.name === userInfo.className);
        console.log('找到对应的班级:', selectedClass);
        if (selectedClass) {
          classId = selectedClass.id;
        }
      }
      console.log('要保存的班级ID:', classId);

      // 更新用户基本信息
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userInfo.name,
          email: userInfo.email,
          class_id: classId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) {
        console.error('更新用户信息失败:', error);
        showErrorMessage('个人信息更新失败');
        return;
      }

      setIsEditMode(false);
      setOriginalUserInfo(userInfo);
      showSuccessMessage('个人信息更新成功');
    } catch (error) {
      console.error('保存用户信息失败:', error);
      showErrorMessage('个人信息更新失败');
    }
  };

  

  const handleUpdateAvatar = () => {
    showSuccessMessage('头像更新功能开发中');
  };

  const handleChangeEmail = () => {
    setShowEmailModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorMessage('两次输入的新密码不一致');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showErrorMessage('新密码长度至少6位');
      return;
    }
    
    if (!userProfile) {
      showErrorMessage('用户信息未加载');
      return;
    }
    
    try {
      // 验证旧密码是否正确（系统当前使用明文密码存储）
      const { data: userData, error: verifyError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userProfile.id)
        .single();

      if (verifyError || !userData) {
        console.error('验证用户失败:', verifyError);
        showErrorMessage('用户验证失败');
        return;
      }

      // 检查旧密码是否匹配（注意：系统当前直接比较明文密码）
      if (userData.password_hash !== passwordForm.oldPassword) {
        console.log('密码验证失败:', {
          storedPassword: userData.password_hash,
          inputPassword: passwordForm.oldPassword,
          match: userData.password_hash === passwordForm.oldPassword
        });
        showErrorMessage('旧密码输入错误');
        return;
      }
      
      console.log('密码验证成功，准备更新密码');

      // 更新数据库中的密码
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: passwordForm.newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error('密码更新失败:', updateError);
        showErrorMessage('密码更新失败：' + updateError.message);
        return;
      }

      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showSuccessMessage('密码修改成功');
    } catch (error) {
      console.error('密码修改异常:', error);
      showErrorMessage('密码修改失败，请重试');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      showErrorMessage('两次输入的邮箱不一致');
      return;
    }
    
    // 简单的邮箱格式验证
    const emailRegex = /^[^ -\s@]+@[^ -\s@]+\.[^ -\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      showErrorMessage('请输入有效的邮箱地址');
      return;
    }
    
    // 检查新邮箱是否和当前邮箱相同
    if (emailForm.newEmail === userInfo.email) {
      showErrorMessage('新邮箱不能与当前邮箱相同');
      return;
    }
    
    try {
      if (!userProfile) {
        showErrorMessage('用户信息未加载');
        return;
      }

      // 检查新邮箱是否已被其他用户使用
      const { data: existingEmail, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailForm.newEmail)
        .single();

      if (existingEmail && existingEmail.id !== userProfile.id) {
        showErrorMessage('该邮箱已被其他用户使用');
        return;
      }

      // 直接更新数据库中的邮箱字段
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          email: emailForm.newEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error('邮箱更新失败:', updateError);
        showErrorMessage('邮箱更新失败：' + updateError.message);
        return;
      }

      // 更新本地状态
      setUserInfo({
        ...userInfo,
        email: emailForm.newEmail
      });

      // 同时更新用户资料状态
      setUserProfile({
        ...userProfile,
        email: emailForm.newEmail
      });

      setShowEmailModal(false);
      setEmailForm({ newEmail: '', confirmEmail: '' });
      showSuccessMessage('邮箱修改成功');
    } catch (error) {
      console.error('邮箱修改异常:', error);
      showErrorMessage('邮箱修改失败，请重试');
    }
  };

  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 处理班级选择变更
  const handleClassChange = (classId: string) => {
    console.log('选择班级ID:', classId);
    if (!classId) {
      setUserInfo({
        ...userInfo,
        className: '未分配班级',
        grade: '未分配年级'
      });
      return;
    }
    
    const selectedClass = classes.find(cls => cls.id === classId);
    console.log('找到的班级:', selectedClass);
    if (selectedClass) {
      setUserInfo({
        ...userInfo,
        className: selectedClass.name,
        grade: selectedClass.grades?.name || '未分配年级'
      });
    }
  };

  const showSuccessMessage = (message: string) => {
    const toast = createToast(message, 'success');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showErrorMessage = (message: string) => {
    const toast = createToast(message, 'error');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const createToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-6 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
        <span>${message}</span>
      </div>
    `;
    return toast;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-bg-light border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* 左侧Logo区域 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">河北师范大学软件学院</h1>
                <p className="text-xs text-text-muted">软院项目通</p>
              </div>
            </div>
          </div>
          
          {/* 中间搜索区域 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索项目..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
              <img 
                src={userInfo.avatarUrl || "https://s.coze.cn/image/cqWetb7C3JE/"} 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">{userInfo.name}</span>
              <i className="fas fa-chevron-down text-xs text-text-muted"></i>
            </div>
          </div>
        </div>
      </header>

      {/* 左侧导航栏 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-bg-light border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-home text-lg"></i>
                <span className="font-medium">首页</span>
              </Link>
            </li>
            <li>
              <Link to="/project-intro" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-folder-open text-lg"></i>
                <span className="font-medium">成果发布</span>
              </Link>
            </li>
            <li>
              <Link to="/business-process" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-sitemap text-lg"></i>
                <span className="font-medium">成果管理</span>
              </Link>
            </li>
            <li>
              <Link to="/student-info" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-users text-lg"></i>
                <span className="font-medium">数据看板</span>
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500 w-full text-left">
                <i className="fas fa-sign-out-alt text-lg"></i>
                <span className="font-medium">退出登录</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* 主内容区域 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-orange-500 mb-2"></i>
              <p className="text-text-secondary">正在加载用户信息...</p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {!loading && !userProfile && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-2xl text-red-500 mb-2"></i>
              <p className="text-text-secondary">无法加载用户信息</p>
              <button 
                onClick={fetchUserProfile}
                className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                重新加载
              </button>
            </div>
          </div>
        )}

        {/* 主要内容 - 仅在加载完成且用户数据存在时显示 */}
        {!loading && userProfile && (
          <>
            {/* 页面头部 */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-2">个人中心</h2>
                  <nav className="text-sm text-text-muted">
                    <span>首页</span>
                    <i className="fas fa-chevron-right mx-2"></i>
                    <span className="text-text-primary">个人中心</span>
                  </nav>
                </div>
              </div>
            </div>

        {/* 基本信息模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center">
              <i className="fas fa-user text-orange-500 mr-3"></i>
              基本信息
            </h3>
            <button 
              onClick={handleEditToggle}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <i className={`fas ${isEditMode ? 'fa-times' : 'fa-edit'} mr-2`}></i>
              {isEditMode ? '取消' : '编辑'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 第一行：姓名和邮箱 */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-text-secondary font-medium">姓名：</span>
              {isEditMode ? (
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  className="text-text-primary font-semibold bg-white border border-border-light px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="text-text-primary font-semibold">
                  {userInfo.name}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-text-secondary font-medium">邮箱：</span>
              {isEditMode ? (
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                  className="text-text-primary font-semibold bg-white border border-border-light px-2 py-1 rounded w-48"
                />
              ) : (
                <span className="text-text-primary font-semibold">
                  {userInfo.email}
                </span>
              )}
            </div>
            
            {/* 第二行：年级和班级 */}
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-text-secondary font-medium">年级：</span>
              <span className="text-text-primary font-semibold">
                {userInfo.grade}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-light">
              <span className="text-text-secondary font-medium">班级：</span>
              {isEditMode ? (
                <select
                  value={userInfo.className === '未分配班级' ? '' : classes.find(cls => cls.name === userInfo.className)?.id || ''}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="text-text-primary font-semibold bg-white border border-border-light px-2 py-1 rounded w-48"
                  disabled={classes.length === 0}
                >
                  <option value="">{classes.length === 0 ? '加载中...' : '请选择班级'}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-text-primary font-semibold">
                  {userInfo.className}
                </span>
              )}
            </div>
          </div>
          
          {/* 编辑模式下的保存按钮 */}
          {isEditMode && (
            <div className="mt-6 flex justify-end space-x-4">
              <button 
                onClick={handleEditToggle}
                className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <i className="fas fa-save mr-2"></i>
                保存
              </button>
            </div>
          )}
        </section>

        {/* 安全设置模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
            <i className="fas fa-cog text-orange-500 mr-3"></i>
            安全设置
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* 修改密码和修改邮箱 - 一行两列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-3 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-key text-orange-500"></i>
                    <span className="font-medium text-text-primary">修改密码</span>
                  </div>
                  <i className="fas fa-chevron-right text-text-muted"></i>
                </div>
              </button>
              
              <button 
                onClick={handleChangeEmail}
                className="px-4 py-3 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-envelope text-orange-500"></i>
                    <span className="font-medium text-text-primary">修改邮箱</span>
                  </div>
                  <i className="fas fa-chevron-right text-text-muted"></i>
                </div>
              </button>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* 修改密码弹窗 */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPasswordModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">修改密码</h3>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="old-password" className="block text-sm font-medium text-text-primary mb-2">
                    旧密码
                  </label>
                  <input 
                    type="password" 
                    id="old-password" 
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入旧密码" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-text-primary mb-2">
                    新密码
                  </label>
                  <input 
                    type="password" 
                    id="new-password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入新密码" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary mb-2">
                    确认新密码
                  </label>
                  <input 
                    type="password" 
                    id="confirm-password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请再次输入新密码" 
                    required 
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    确认修改
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 修改邮箱弹窗 */}
      {showEmailModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEmailModal(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">修改邮箱</h3>
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-email" className="block text-sm font-medium text-text-primary mb-2">
                    新邮箱地址
                  </label>
                  <input 
                    type="email" 
                    id="new-email" 
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请输入新邮箱地址" 
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="confirm-email" className="block text-sm font-medium text-text-primary mb-2">
                    确认新邮箱
                  </label>
                  <input 
                    type="email" 
                    id="confirm-email" 
                    value={emailForm.confirmEmail}
                    onChange={(e) => setEmailForm({...emailForm, confirmEmail: e.target.value})}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                    placeholder="请再次输入新邮箱地址" 
                    required 
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    确认修改
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalCenter;

