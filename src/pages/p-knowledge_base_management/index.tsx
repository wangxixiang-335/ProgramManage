

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const KnowledgeBaseManagement: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('knowledge-link');
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 知识库管理';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (itemId: string, href: string) => {
    setActiveNavItem(itemId);
    
    if (href === '#') {
      // 处理没有跳转的情况，如系统设置
      console.log('点击了系统设置');
    } else if (href === '/login') {
      // 退出登录确认
      if (confirm('确定要退出登录吗？')) {
        navigate('/login');
      }
    }
  };

  const handleKnowledgeCategoryClick = (categoryId: string) => {
    console.log('查看知识库分类: ' + categoryId);
    // 在实际应用中，这里会跳转到相应的分类页面
  };

  const handleOrganizationClick = (sectionId: string) => {
    console.log('查看组织架构: ' + sectionId);
    // 在实际应用中，这里会跳转到相应的组织架构页面
  };

  const handleViewAllUpdates = () => {
    console.log('查看全部更新');
    // 在实际应用中，这里会跳转到全部更新页面
  };

  const handleUserProfileClick = () => {
    console.log('打开用户菜单');
    // 在实际应用中，这里会显示用户菜单
  };

  const handleNotificationClick = () => {
    console.log('打开通知面板');
    // 在实际应用中，这里会显示通知面板
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
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'dashboard-link' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('dashboard-link', '/admin-home')}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'carousel-link' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('carousel-link', '/carousel-management')}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'news-link' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('news-link', '/news-management')}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'achievements-link' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('achievements-link', '/achievement-library-management')}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management" 
                    className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center px-4 py-3 text-green-600 rounded-r-lg`}
                    onClick={() => handleNavItemClick('knowledge-link', '/knowledge-base-management')}
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'users-link' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('users-link', '/user-management')}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                
                <li>
                  <button 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg w-full text-left`}
                    onClick={() => handleNavItemClick('logout-link', '/login')}
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center mr-3"></i>
                    <span>退出登录</span>
                  </button>
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
            <h2 className="text-2xl font-bold text-text-primary">知识库管理</h2>
            <p className="text-text-muted mt-1">管理系统使用说明、成果提炼和组织架构信息</p>
          </div>
          
          {/* 知识库分类 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 前端系统使用说明 */}
            <div className={`bg-bg-light rounded-xl shadow-card p-6 ${styles.knowledgeCard} ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.1s'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <i className="fas fa-code text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">前端系统使用说明</h3>
              </div>
              <p className="text-text-secondary mb-4">详细介绍系统前端界面的使用方法、功能模块和操作流程，帮助用户快速上手系统。</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">12 篇文档</span>
                <button 
                  className="text-green-600 hover:text-green-700 flex items-center"
                  onClick={() => handleKnowledgeCategoryClick('frontend-docs')}
                >
                  <span>查看文档</span>
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>
            </div>
            
            {/* 后端系统使用说明 */}
            <div className={`bg-bg-light rounded-xl shadow-card p-6 ${styles.knowledgeCard} ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <i className="fas fa-server text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">后端系统使用说明</h3>
              </div>
              <p className="text-text-secondary mb-4">提供系统后端架构、API接口文档和数据结构说明，方便开发人员进行系统维护和扩展。</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">8 篇文档</span>
                <button 
                  className="text-green-600 hover:text-green-700 flex items-center"
                  onClick={() => handleKnowledgeCategoryClick('backend-docs')}
                >
                  <span>查看文档</span>
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>
            </div>
            
            {/* 成果内容提炼 */}
            <div className={`bg-bg-light rounded-xl shadow-card p-6 ${styles.knowledgeCard} ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.3s'}}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                  <i className="fas fa-file-alt text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">成果内容提炼</h3>
              </div>
              <p className="text-text-secondary mb-4">汇总所有项目成果的核心内容、技术亮点和应用价值，便于快速了解各成果的主要信息。</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">24 篇提炼</span>
                <button 
                  className="text-green-600 hover:text-green-700 flex items-center"
                  onClick={() => handleKnowledgeCategoryClick('achievement-summaries')}
                >
                  <span>查看提炼</span>
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* 组织架构说明 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-6 mb-8 ${styles.fadeIn}`} style={{animationDelay: '0.4s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                <i className="fas fa-sitemap text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-text-primary">组织架构说明</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border-light rounded-lg p-4">
                <h4 className="text-lg font-medium text-text-primary mb-3">部门结构</h4>
                <p className="text-text-secondary mb-4">详细介绍软件学院各部门的职责分工、人员配置和工作流程，帮助了解学院的组织架构。</p>
                <button 
                  className="text-green-600 hover:text-green-700 flex items-center"
                  onClick={() => handleOrganizationClick('department-structure')}
                >
                  <span>查看详情</span>
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>
              
              <div className="border border-border-light rounded-lg p-4">
                <h4 className="text-lg font-medium text-text-primary mb-3">项目团队</h4>
                <p className="text-text-secondary mb-4">介绍各项目团队的组成、负责项目和技术专长，便于跨团队协作和资源调配。</p>
                <button 
                  className="text-green-600 hover:text-green-700 flex items-center"
                  onClick={() => handleOrganizationClick('project-teams')}
                >
                  <span>查看详情</span>
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* 最近更新的知识库内容 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">最近更新</h3>
              <button 
                className="text-green-600 hover:text-green-700 flex items-center"
                onClick={handleViewAllUpdates}
              >
                <span>查看全部</span>
                <i className="fas fa-chevron-right ml-1 text-xs"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 更新项1 */}
              <div className="flex items-start p-4 border-b border-border-light">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                  <i className="fas fa-edit"></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-text-primary">前端系统使用说明 - 新增数据可视化模块</h4>
                    <span className="text-xs text-text-muted">今天 10:23</span>
                  </div>
                  <p className="text-text-secondary mt-2">更新了数据可视化模块的使用说明，增加了图表类型选择和数据导入导出功能的详细介绍。</p>
                </div>
              </div>
              
              {/* 更新项2 */}
              <div className="flex items-start p-4 border-b border-border-light">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                  <i className="fas fa-plus"></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-text-primary">成果内容提炼 - 2024年春季项目展示会</h4>
                    <span className="text-xs text-text-muted">昨天 15:47</span>
                  </div>
                  <p className="text-text-secondary mt-2">新增了2024年春季项目展示会的成果提炼，包括12个优秀项目的核心技术和应用价值分析。</p>
                </div>
              </div>
              
              {/* 更新项3 */}
              <div className="flex items-start p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                  <i className="fas fa-refresh"></i>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-text-primary">组织架构说明 - 部门职责调整</h4>
                    <span className="text-xs text-text-muted">2024-05-18 09:15</span>
                  </div>
                  <p className="text-text-secondary mt-2">更新了组织架构说明，调整了部分部门的职责分工和人员配置，以适应学院发展需求。</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KnowledgeBaseManagement;

