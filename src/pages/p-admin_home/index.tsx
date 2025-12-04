

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 管理员首页';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (itemId: string) => {
    setActiveNavItem(itemId);
  };

  const handleQuickActionClick = (actionName: string) => {
    console.log('执行快速操作: ' + actionName);
    // 在实际应用中，这里会打开相应的表单或页面
  };

  const handleUserProfileClick = () => {
    console.log('打开用户菜单');
    // 在实际应用中，这里会显示用户菜单
  };

  const handleNotificationClick = () => {
    console.log('打开通知面板');
    // 在实际应用中，这里会显示通知面板
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    if (confirm('确定要退出登录吗？')) {
      // 继续默认行为，跳转到登录页
    } else {
      e.preventDefault();
    }
  };

  const handleViewAllActivitiesClick = () => {
    console.log('查看全部活动');
    // 在实际应用中，这里会跳转到活动列表页
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="bg-bg-light shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-shield text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">软院项目通</h1>
              <p className="text-xs text-text-muted">管理员后台</p>
            </div>
          </div>
          
          {/* 右侧用户信息 */}
          <div className="flex items-center space-x-4">
            <div 
              className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100"
              onClick={handleNotificationClick}
            >
              <i className="fas fa-bell text-text-secondary"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleUserProfileClick}
            >
              <div className="w-8 h-8 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600">
                <i className="fas fa-user"></i>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user?.full_name || '管理员'}</p>
                <p className="text-xs text-text-muted">系统管理员</p>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-muted"></i>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <aside className={`w-64 bg-bg-light shadow-sidebar flex-shrink-0 hidden md:block ${isMobileMenuOpen ? 'fixed inset-0 z-40' : ''}`}>
          <nav className="py-4">
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">主要功能</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/admin-home" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'dashboard' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('dashboard')}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'carousel' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('carousel')}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'news' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('news')}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'achievements' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('achievements')}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'knowledge' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('knowledge')}
                  >
                    <i className="fas fa-book w-5 text-center mr-3"></i>
                    <span>知识库管理</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="px-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">系统设置</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/user-management" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'users' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('users')}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className={`${styles.sidebarItem} ${activeNavItem === 'logout' ? styles.sidebarItemActive : ''} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={(e) => {
                      handleNavItemClick('logout');
                      handleLogoutClick(e);
                    }}
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center mr-3"></i>
                    <span>退出登录</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>
        
        {/* 移动端菜单按钮 */}
        <button 
          className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg z-50"
          onClick={handleMobileMenuToggle}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 页面标题 */}
          <div className={`mb-6 ${styles.fadeIn}`}>
            <h2 className="text-2xl font-bold text-text-primary">管理员控制台</h2>
            <p className="text-text-muted mt-1">欢迎回来，管理员！这是您的系统概览</p>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 轮播图统计 */}
            <div className={`${styles.statCard} ${styles.cardHover} ${styles.fadeIn} rounded-xl p-5 shadow-card`} style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">轮播图</h3>
                <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-green-600">
                  <i className="fas fa-images"></i>
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">12</p>
              <p className="text-sm text-text-muted mt-1">当前轮播图数量</p>
            </div>
            
            {/* 新闻统计 */}
            <div className={`${styles.statCard} ${styles.cardHover} ${styles.fadeIn} rounded-xl p-5 shadow-card`} style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">新闻</h3>
                <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-green-600">
                  <i className="fas fa-newspaper"></i>
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">48</p>
              <p className="text-sm text-text-muted mt-1">已发布新闻数量</p>
            </div>
            
            {/* 成果统计 */}
            <div className={`${styles.statCard} ${styles.cardHover} ${styles.fadeIn} rounded-xl p-5 shadow-card`} style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">成果</h3>
                <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-green-600">
                  <i className="fas fa-award"></i>
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">76</p>
              <p className="text-sm text-text-muted mt-1">已收录成果数量</p>
            </div>
            
            {/* 知识库统计 */}
            <div className={`${styles.statCard} ${styles.cardHover} ${styles.fadeIn} rounded-xl p-5 shadow-card`} style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">知识库</h3>
                <div className="w-10 h-10 bg-white bg-opacity-50 rounded-full flex items-center justify-center text-green-600">
                  <i className="fas fa-book"></i>
                </div>
              </div>
              <p className="text-3xl font-bold text-text-primary">128</p>
              <p className="text-sm text-text-muted mt-1">知识库文章数量</p>
            </div>
          </div>
          
          {/* 最近活动和快速操作 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 最近活动 */}
            <div className={`lg:col-span-2 bg-bg-light rounded-xl shadow-card p-5 ${styles.fadeIn}`} style={{animationDelay: '0.5s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">最近活动</h3>
                <button 
                  className="text-sm text-green-600 hover:text-green-700"
                  onClick={handleViewAllActivitiesClick}
                >
                  查看全部
                </button>
              </div>
              
              <div className="space-y-4">
                {/* 活动项1 */}
                <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fas fa-plus text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-text-primary">
                      新增了一篇新闻 <span className="text-green-600 font-medium">"2024年软件学院项目展示会顺利举行"</span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">今天 10:23</p>
                  </div>
                </div>
                
                {/* 活动项2 */}
                <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fas fa-edit text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-text-primary">
                      更新了轮播图 <span className="text-green-600 font-medium">"学院最新通知"</span>
                    </p>
                    <p className="text-xs text-text-muted mt-1">昨天 15:47</p>
                  </div>
                </div>
                
                {/* 活动项3 */}
                <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fas fa-upload text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-text-primary">上传了3个新的成果到成果库</p>
                    <p className="text-xs text-text-muted mt-1">2024-05-18 09:15</p>
                  </div>
                </div>
                
                {/* 活动项4 */}
                <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                    <i className="fas fa-book text-sm"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-text-primary">在知识库中添加了5篇新文章</p>
                    <p className="text-xs text-text-muted mt-1">2024-05-17 14:30</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 快速操作 */}
            <div className={`bg-bg-light rounded-xl shadow-card p-5 ${styles.fadeIn}`} style={{animationDelay: '0.6s'}}>
              <h3 className="text-lg font-semibold text-text-primary mb-4">快速操作</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* 添加轮播图 */}
                <button 
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  onClick={() => handleQuickActionClick('添加轮播图')}
                >
                  <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <i className="fas fa-plus"></i>
                  </div>
                  <span className="text-sm text-text-primary">添加轮播图</span>
                </button>
                
                {/* 发布新闻 */}
                <button 
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  onClick={() => handleQuickActionClick('发布新闻')}
                >
                  <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <i className="fas fa-pen"></i>
                  </div>
                  <span className="text-sm text-text-primary">发布新闻</span>
                </button>
                
                {/* 上传成果 */}
                <button 
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  onClick={() => handleQuickActionClick('上传成果')}
                >
                  <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <i className="fas fa-upload"></i>
                  </div>
                  <span className="text-sm text-text-primary">上传成果</span>
                </button>
                
                {/* 添加知识库文章 */}
                <button 
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  onClick={() => handleQuickActionClick('添加文章')}
                >
                  <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <i className="fas fa-book"></i>
                  </div>
                  <span className="text-sm text-text-primary">添加文章</span>
                </button>
              </div>
              
              {/* 系统信息 */}
              <div className="mt-6 pt-5 border-t border-border-light">
                <h4 className="text-sm font-medium text-text-primary mb-3">系统信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">系统版本</span>
                    <span className="text-text-primary">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">上次更新</span>
                    <span className="text-text-primary">2024-05-15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">在线用户</span>
                    <span className="text-text-primary">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHomePage;

