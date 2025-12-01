

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface UserInfo {
  name: string;
  studentId: string;
  major: string;
  className: string;
  contact: string;
  email: string;
  entryYear: string;
  registerTime: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  imageUrl: string;
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
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: user?.username || '用户',
    studentId: '20211101001',
    major: '软件工程',
    className: '21级软件1班',
    contact: '138****8888',
    email: user?.email || 'user@mail.hebtu.edu.cn',
    entryYear: '2021年',
    registerTime: '2021-09-01'
  });
  const [originalUserInfo, setOriginalUserInfo] = useState<UserInfo>(userInfo);
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const projects: Project[] = [
    {
      id: 'project1',
      title: '在线教育平台设计与实现',
      description: '课程项目 · 李教授 · 2024-01-10',
      status: '进行中',
      statusColor: 'bg-secondary bg-opacity-20 text-secondary',
      imageUrl: 'https://s.coze.cn/image/3zvQ8tPiRIY/'
    },
    {
      id: 'project2',
      title: '校园生活服务APP开发',
      description: '课程项目 · 张老师 · 2024-01-05',
      status: '已完成',
      statusColor: 'bg-green-100 text-green-600',
      imageUrl: 'https://s.coze.cn/image/48s1-1sYZyI/'
    },
    {
      id: 'project3',
      title: '区块链技术在供应链管理中的应用',
      description: '课程项目 · 陈老师 · 2024-01-01',
      status: '进行中',
      statusColor: 'bg-secondary bg-opacity-20 text-secondary',
      imageUrl: 'https://s.coze.cn/image/twlnD01KoyI/'
    }
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      type: '系统通知',
      content: '您的个人信息已更新成功，感谢您的使用。',
      time: '2024-01-15 10:30',
      iconColor: 'bg-secondary'
    },
    {
      id: '2',
      type: '项目更新',
      content: '在线教育平台项目有新的进度更新，请及时查看。',
      time: '2024-01-14 16:45',
      iconColor: 'bg-accent'
    },
    {
      id: '3',
      type: '活动通知',
      content: '学院将举办项目展示活动，欢迎各位同学积极参与。',
      time: '2024-01-13 09:20',
      iconColor: 'bg-green-500'
    },
    {
      id: '4',
      type: '系统通知',
      content: '系统将于本周末进行维护升级，期间可能影响正常使用。',
      time: '2024-01-12 14:10',
      iconColor: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 个人中心';
    return () => { document.title = originalTitle; };
  }, []);

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

  const handleSaveEdit = () => {
    setIsEditMode(false);
    showSuccessMessage('个人信息更新成功');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-detail?projectId=${projectId}`);
  };

  const handleUpdateAvatar = () => {
    showSuccessMessage('头像更新功能开发中');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showErrorMessage('两次输入的新密码不一致');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showErrorMessage('新密码长度至少6位');
      return;
    }
    
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showSuccessMessage('密码修改成功');
  };

  const handleChangeEmail = () => {
    showSuccessMessage('邮箱修改功能开发中');
  };

  const handleChangePhone = () => {
    showSuccessMessage('手机号修改功能开发中');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                src="https://s.coze.cn/image/cqWetb7C3JE/" 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">张同学</span>
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
                <span className="font-medium">项目简介</span>
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
              <Link to="/media-consult" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-newspaper text-lg"></i>
                <span className="font-medium">媒体咨询</span>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">姓名：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, name: e.target.textContent || ''})}
                >
                  {userInfo.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">学号：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, studentId: e.target.textContent || ''})}
                >
                  {userInfo.studentId}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">专业：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, major: e.target.textContent || ''})}
                >
                  {userInfo.major}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">班级：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, className: e.target.textContent || ''})}
                >
                  {userInfo.className}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">联系方式：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, contact: e.target.textContent || ''})}
                >
                  {userInfo.contact}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">邮箱：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, email: e.target.textContent || ''})}
                >
                  {userInfo.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">入学年份：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, entryYear: e.target.textContent || ''})}
                >
                  {userInfo.entryYear}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border-light">
                <span className="text-text-secondary">注册时间：</span>
                <span 
                  className={`text-text-primary font-medium ${isEditMode ? 'bg-white border border-border-light p-2 rounded' : ''}`}
                  contentEditable={isEditMode}
                  suppressContentEditableWarning={true}
                  onInput={(e) => setUserInfo({...userInfo, registerTime: e.target.textContent || ''})}
                >
                  {userInfo.registerTime}
                </span>
              </div>
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

        {/* 参与项目模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
            <i className="fas fa-project-diagram text-orange-500 mr-3"></i>
            参与项目
          </h3>
          
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className={`${styles.projectItem} flex items-center justify-between p-4 border border-border-light rounded-lg cursor-pointer`}
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={project.imageUrl} 
                    alt={`${project.title}项目截图`}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-text-primary">{project.title}</h4>
                    <p className="text-sm text-text-muted">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 ${project.statusColor} text-xs rounded-full`}>
                    {project.status}
                  </span>
                  <i className="fas fa-chevron-right text-text-muted"></i>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/project-intro" className="text-orange-500 hover:text-orange-600 font-medium">
              查看更多项目 <i className="fas fa-arrow-right ml-1"></i>
            </Link>
          </div>
        </section>

        {/* 消息通知模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
            <i className="fas fa-bell text-orange-500 mr-3"></i>
            消息通知
          </h3>
          
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`${styles.notificationItem} p-4 border border-border-light rounded-lg`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 ${notification.iconColor} rounded-full mt-2 flex-shrink-0`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">{notification.type}</span>
                      <span className="text-xs text-text-muted">{notification.time}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{notification.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 个人设置模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
            <i className="fas fa-cog text-orange-500 mr-3"></i>
            个人设置
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 更新头像 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-primary">头像设置</h4>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img 
                    src="https://s.coze.cn/image/3i02097jaU8/" 
                    alt="当前头像"
                    className="w-20 h-20 rounded-full object-cover border-4 border-border-light"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-camera text-white text-xs"></i>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={handleUpdateAvatar}
                    className="px-4 py-2 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    更新头像
                  </button>
                  <p className="text-sm text-text-muted">支持JPG、PNG格式，文件大小不超过2MB</p>
                </div>
              </div>
            </div>
            
            {/* 修改密码 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-primary">安全设置</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-3 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-left"
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
                  className="w-full px-4 py-3 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-envelope text-orange-500"></i>
                      <span className="font-medium text-text-primary">修改邮箱</span>
                    </div>
                    <i className="fas fa-chevron-right text-text-muted"></i>
                  </div>
                </button>
                
                <button 
                  onClick={handleChangePhone}
                  className="w-full px-4 py-3 border border-border-light rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-mobile-alt text-orange-500"></i>
                      <span className="font-medium text-text-primary">修改手机号</span>
                    </div>
                    <i className="fas fa-chevron-right text-text-muted"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
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
    </div>
  );
};

export default PersonalCenter;

