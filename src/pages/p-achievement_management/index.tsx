

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface Achievement {
  id: string;
  title: string;
  publishDate: string;
  status: 'published' | 'pending' | 'rejected' | 'draft';
  coverImage?: string;
  rejectReason?: string;
  aiSuggestion?: string;
  category: string;
}

type FilterType = 'all' | 'published' | 'pending' | 'rejected' | 'draft';

const AchievementManagement: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果管理';
    return () => { document.title = originalTitle; };
  }, []);

  // 模拟成果数据
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: '基于深度学习的图像识别系统',
      publishDate: '2024-06-10',
      status: 'published',
      coverImage: 'https://s.coze.cn/image/sElnk0HE2ms/',
      category: '科技'
    },
    {
      id: '2',
      title: '移动应用开发实践报告',
      publishDate: '2024-06-14',
      status: 'pending',
      coverImage: 'https://s.coze.cn/image/mHaxVQEMBRk/',
      category: '科技'
    },
    {
      id: '3',
      title: '数据库设计方案',
      publishDate: '2024-06-12',
      status: 'rejected',
      coverImage: 'https://s.coze.cn/image/hZMXPxRlxa8/',
      rejectReason: '数据库设计方案不够详细，缺少性能优化部分和安全机制设计。',
      aiSuggestion: '1. 添加索引优化策略；2. 设计数据分片方案；3. 增加访问控制和数据加密机制。',
      category: '科技'
    },
    {
      id: '4',
      title: 'Web前端开发技术总结',
      publishDate: '2024-06-13',
      status: 'draft',
      category: '科技'
    }
  ]);

  // 筛选和搜索逻辑
  const filteredAchievements = achievements.filter(achievement => {
    const matchesStatus = activeFilter === 'all' || achievement.status === activeFilter;
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 状态筛选处理
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 编辑成果
  const handleEditAchievement = (achievementId: string) => {
    alert(`编辑成果 ${achievementId}`);
  };

  // 删除成果
  const handleDeleteAchievement = (achievementId: string) => {
    if (confirm('确定要删除该成果吗？此操作不可恢复。')) {
      alert(`删除成果 ${achievementId}`);
    }
  };

  // 撤回成果
  const handleWithdrawAchievement = (achievementId: string) => {
    if (confirm('确定要撤回该成果吗？撤回后将变为草稿状态。')) {
      alert(`撤回成果 ${achievementId}`);
    }
  };

  // 通知按钮
  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };

  // 渲染状态标签
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className={`${styles.statusBadge} ${styles.statusPublished}`}>已发布</span>;
      case 'pending':
        return <span className={`${styles.statusBadge} ${styles.statusPending}`}>审核中</span>;
      case 'rejected':
        return <span className={`${styles.statusBadge} ${styles.statusRejected}`}>未通过</span>;
      case 'draft':
        return <span className={`${styles.statusBadge} ${styles.statusDraft}`}>草稿</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-gray min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <aside 
          className={`w-64 bg-white shadow-sidebar flex-shrink-0 ${
            isMobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden md:block'
          }`}
        >
          {/* 学院Logo */}
          <div className="p-6 border-b border-border-light">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">河北师范大学</h1>
                <p className="text-xs text-text-muted">软件学院</p>
              </div>
            </div>
          </div>
          
          {/* 导航菜单 */}
          <nav className="py-4">
            <ul>
              <li>
                <Link 
                  to="/teacher-home" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-chart-line w-6 text-center"></i>
                  <span className="ml-3">数据看板</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-approval" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-tasks w-6 text-center"></i>
                  <span className="ml-3">成果审批</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">12</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-publish" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-paper-plane w-6 text-center"></i>
                  <span className="ml-3">成果发布</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-management" 
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3 font-medium">成果管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-view" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-eye w-6 text-center"></i>
                  <span className="ml-3">成果查看</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* 底部导航 */}
          <div className="mt-auto p-4 border-t border-border-light">
            <ul>
              <li>
                <button className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover} w-full text-left`}>
                  <i className="fas fa-user-cog w-6 text-center"></i>
                  <span className="ml-3">设置</span>
                </button>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-sign-out-alt w-6 text-center"></i>
                  <span className="ml-3">退出登录</span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
        
        {/* 主内容区域 */}
        <main className="flex-1 overflow-y-auto bg-bg-gray">
          {/* 顶部导航栏 */}
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between px-6 py-4">
              {/* 移动端菜单按钮 */}
              <button 
                onClick={handleMobileMenuToggle}
                className="md:hidden text-text-primary"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              
              {/* 页面标题 */}
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果管理</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button 
                    onClick={handleNotificationClick}
                    className="text-text-secondary hover:text-secondary"
                  >
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/udvpYWfxP2U/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">张教授</p>
                    <p className="text-xs text-text-muted">计算机科学与技术系</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* 内容区域 */}
          <div className="p-6">
            {/* 筛选和搜索区域 */}
            <div className={`bg-white rounded-xl shadow-card p-6 mb-6 ${styles.fadeIn}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                {/* 状态筛选 */}
                <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                  <button 
                    onClick={() => handleFilterChange('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'all' 
                        ? 'bg-secondary text-white' 
                        : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    全部成果
                  </button>
                  <button 
                    onClick={() => handleFilterChange('published')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'published' 
                        ? 'bg-secondary text-white' 
                        : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    已发布
                  </button>
                  <button 
                    onClick={() => handleFilterChange('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'pending' 
                        ? 'bg-secondary text-white' 
                        : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    审核中
                  </button>
                  <button 
                    onClick={() => handleFilterChange('rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'rejected' 
                        ? 'bg-secondary text-white' 
                        : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    未通过
                  </button>
                  <button 
                    onClick={() => handleFilterChange('draft')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeFilter === 'draft' 
                        ? 'bg-secondary text-white' 
                        : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    草稿箱
                  </button>
                </div>
                
                {/* 搜索框 */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="按名称搜索成果..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full md:w-64 pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                </div>
              </div>
            </div>
            
            {/* 成果列表 */}
            <div className="space-y-4">
              {filteredAchievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className={`bg-white rounded-xl shadow-card p-4 transition-all duration-300 ${styles.cardHover} ${styles.fadeIn}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* 封面图 */}
                    <div className="w-full md:w-24 h-24 md:h-auto rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-4">
                      {achievement.coverImage ? (
                        <img 
                          src={achievement.coverImage} 
                          alt={`${achievement.title}封面`} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <i className="fas fa-file-alt text-3xl text-text-muted"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* 成果信息 */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary">{achievement.title}</h3>
                          <p className="text-text-muted text-sm mt-1">
                            {achievement.status === 'draft' ? '最后编辑' : '发布时间'}：{achievement.publishDate}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          {renderStatusBadge(achievement.status)}
                        </div>
                      </div>
                      
                      {/* 驳回原因 */}
                      {achievement.rejectReason && (
                        <div className="mt-2 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-500">
                            <i className="fas fa-exclamation-circle mr-1"></i> 驳回原因：{achievement.rejectReason}
                          </p>
                        </div>
                      )}
                      
                      {/* AI解决方案 */}
                      {achievement.aiSuggestion && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-500">
                            <i className="fas fa-robot mr-1"></i> AI建议：{achievement.aiSuggestion}
                          </p>
                        </div>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="flex mt-4 space-x-2">
                        {achievement.status !== 'pending' && (
                          <>
                            <button 
                              onClick={() => handleEditAchievement(achievement.id)}
                              className="px-3 py-1 bg-primary text-secondary rounded-lg text-sm font-medium hover:bg-blue-100"
                            >
                              <i className="fas fa-edit mr-1"></i> 编辑
                            </button>
                            <button 
                              onClick={() => handleDeleteAchievement(achievement.id)}
                              className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100"
                            >
                              <i className="fas fa-trash-alt mr-1"></i> 删除
                            </button>
                          </>
                        )}
                        {achievement.status === 'pending' && (
                          <button 
                            onClick={() => handleWithdrawAchievement(achievement.id)}
                            className="px-3 py-1 bg-amber-50 text-amber-500 rounded-lg text-sm font-medium hover:bg-amber-100"
                          >
                            <i className="fas fa-undo mr-1"></i> 撤回
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 分页 */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button 
                  className="px-3 py-2 rounded-lg border border-border-light text-text-secondary hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-white">1</button>
                <button 
                  className="px-3 py-2 rounded-lg border border-border-light text-text-secondary hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementManagement;

