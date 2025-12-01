

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { AchievementType } from '../../types/achievement';
import styles from './styles.module.css';

interface Achievement {
  id: string;
  name: string;
  score: number;
  type: string;
  studentName: string;
  teacherName: string;
  submitTime: string;
}

const AchievementLibraryManagement: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('achievements');
  const [currentPage, setCurrentPage] = useState(1);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  
  // 搜索条件状态
  const [searchConditions, setSearchConditions] = useState({
    class: '',
    type: '',
    score: '',
    name: '',
    student: ''
  });

  // 加载成果类型
  useEffect(() => {
    loadAchievementTypes();
  }, []);
  
  const loadAchievementTypes = async () => {
    try {
      const result = await AchievementService.getAchievementTypes();
      if (result.success && result.data) {
        setAchievementTypes(result.data);
      }
    } catch (error) {
      console.error('加载成果类型失败:', error);
    }
  };

  // 模拟成果数据
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: '智能校园导航系统',
      score: 95,
      type: '项目',
      studentName: '张三',
      teacherName: '李教授',
      submitTime: '2024-05-20'
    },
    {
      id: '2',
      name: '基于机器学习的代码质量评估',
      score: 92,
      type: '论文',
      studentName: '李四',
      teacherName: '王教授',
      submitTime: '2024-05-18'
    },
    {
      id: '3',
      name: '移动应用开发大赛作品',
      score: 88,
      type: '竞赛',
      studentName: '王五',
      teacherName: '张教授',
      submitTime: '2024-05-15'
    },
    {
      id: '4',
      name: '一种新型数据加密方法',
      score: 90,
      type: '专利',
      studentName: '赵六',
      teacherName: '刘教授',
      submitTime: '2024-05-10'
    },
    {
      id: '5',
      name: '云计算资源调度优化',
      score: 85,
      type: '项目',
      studentName: '孙七',
      teacherName: '周教授',
      submitTime: '2024-05-05'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果库管理';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 导航项点击处理
  const handleNavItemClick = (itemId: string, href?: string) => {
    setActiveNavItem(itemId);
    if (href && href !== '#') {
      // 对于需要导航的项，让Link组件处理
      return;
    }
    // 对于不需要导航的项（如#），阻止默认行为
    if (href === '#') {
      event?.preventDefault();
    }
  };

  // 搜索处理
  const handleSearch = () => {
    console.log('执行搜索:', searchConditions);
    // 在实际应用中，这里会根据搜索条件过滤成果列表
  };

  // 重置搜索条件
  const handleReset = () => {
    setSearchConditions({
      class: '',
      type: '',
      score: '',
      name: '',
      student: ''
    });
  };

  // 添加成果
  const handleAddAchievement = () => {
    console.log('添加新成果');
    // 在实际应用中，这里会打开添加成果的表单或页面
  };

  // 查看成果
  const handleViewAchievement = (achievementId: string) => {
    console.log('查看成果:', achievementId);
    // 在实际应用中，这里会打开成果详情页面或弹窗
  };

  // 删除成果
  const handleDeleteAchievement = (achievementId: string) => {
    if (confirm('确定要删除这个成果吗？')) {
      console.log('删除成果:', achievementId);
      // 在实际应用中，这里会发送删除请求并更新列表
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    console.log('跳转到页码:', page);
    // 在实际应用中，这里会加载对应页码的数据
  };

  // 用户信息点击
  const handleUserProfileClick = () => {
    console.log('打开用户菜单');
    // 在实际应用中，这里会显示用户菜单
  };

  // 通知图标点击
  const handleNotificationClick = () => {
    console.log('打开通知面板');
    // 在实际应用中，这里会显示通知面板
  };

  // 退出登录
  const handleLogout = (e: React.MouseEvent) => {
    if (confirm('确定要退出登录吗？')) {
      // 继续默认行为，跳转到登录页
    } else {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="bg-bg-light shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center">
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
              <div className="w-8 h-8 bg-[#2E7D32] bg-opacity-20 rounded-full flex items-center justify-center text-[#2E7D32]">
                <i className="fas fa-user"></i>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary">管理员</p>
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'dashboard' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('dashboard')}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'carousel' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('carousel')}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'news' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('news')}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management" 
                    className={`${styles.sidebarItem} ${styles.sidebarItemActive} flex items-center px-4 py-3 text-[#2E7D32] rounded-r-lg`}
                    onClick={() => handleNavItemClick('achievements')}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'knowledge' ? styles.sidebarItemActive : ''}`}
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'users' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('users')}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/system-settings" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'settings' ? styles.sidebarItemActive : ''}`}
                    onClick={() => handleNavItemClick('settings')}
                  >
                    <i className="fas fa-cog w-5 text-center mr-3"></i>
                    <span>系统设置</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-[#2E7D32] rounded-r-lg ${activeNavItem === 'logout' ? styles.sidebarItemActive : ''}`}
                    onClick={(e) => {
                      handleNavItemClick('logout');
                      handleLogout(e);
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
          className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-[#2E7D32] rounded-full flex items-center justify-center text-white shadow-lg z-50"
          onClick={handleMobileMenuToggle}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 页面标题 */}
          <div className={`mb-6 ${styles.fadeIn}`}>
            <h2 className="text-2xl font-bold text-text-primary">成果库管理</h2>
            <p className="text-text-muted mt-1">查看和管理所有学生成果</p>
          </div>
          
          {/* 搜索栏 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-5 mb-6 ${styles.fadeInDelay1}`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">搜索条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 班级选择 */}
              <div className="space-y-2">
                <label htmlFor="class-select" className="block text-sm font-medium text-text-secondary">班级</label>
                <select 
                  id="class-select" 
                  value={searchConditions.class}
                  onChange={(e) => setSearchConditions({...searchConditions, class: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                >
                  <option value="">全部班级</option>
                  <option value="class1">软件工程1班</option>
                  <option value="class2">软件工程2班</option>
                  <option value="class3">软件工程3班</option>
                  <option value="class4">软件工程4班</option>
                </select>
              </div>
              
              {/* 类型选择 */}
              <div className="space-y-2">
                <label htmlFor="type-select" className="block text-sm font-medium text-text-secondary">类型</label>
                <select 
                  id="type-select" 
                  value={searchConditions.type}
                  onChange={(e) => setSearchConditions({...searchConditions, type: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                >
                  <option value="">全部类型</option>
                  {achievementTypes.map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* 分数选择 */}
              <div className="space-y-2">
                <label htmlFor="score-select" className="block text-sm font-medium text-text-secondary">分数</label>
                <select 
                  id="score-select" 
                  value={searchConditions.score}
                  onChange={(e) => setSearchConditions({...searchConditions, score: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                >
                  <option value="">全部分数</option>
                  <option value="90+">90分以上</option>
                  <option value="80-89">80-89分</option>
                  <option value="70-79">70-79分</option>
                  <option value="60-69">60-69分</option>
                  <option value="60-">60分以下</option>
                </select>
              </div>
              
              {/* 名称搜索 */}
              <div className="space-y-2">
                <label htmlFor="name-input" className="block text-sm font-medium text-text-secondary">成果名称</label>
                <input 
                  type="text" 
                  id="name-input" 
                  placeholder="输入成果名称" 
                  value={searchConditions.name}
                  onChange={(e) => setSearchConditions({...searchConditions, name: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                />
              </div>
              
              {/* 姓名搜索 */}
              <div className="space-y-2">
                <label htmlFor="student-input" className="block text-sm font-medium text-text-secondary">学生姓名</label>
                <input 
                  type="text" 
                  id="student-input" 
                  placeholder="输入学生姓名" 
                  value={searchConditions.student}
                  onChange={(e) => setSearchConditions({...searchConditions, student: e.target.value})}
                  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 搜索按钮 */}
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 mr-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors"
                onClick={handleReset}
              >
                重置
              </button>
              <button 
                className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
                onClick={handleSearch}
              >
                搜索
              </button>
            </div>
          </div>
          
          {/* 成果列表 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-5 ${styles.fadeInDelay2}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary">成果列表</h3>
              <div className="flex items-center space-x-2">
                <button 
                className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors flex items-center"
                onClick={handleAddAchievement}
              >
                  <i className="fas fa-plus mr-2"></i>
                  <span>添加成果</span>
                </button>
              </div>
            </div>
            
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">成果名称</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">分数</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">类型</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">学生姓名</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">指导老师</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">提交时间</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((achievement) => (
                    <tr key={achievement.id} className={`border-t border-border-light ${styles.tableRowHover}`}>
                      <td className="px-4 py-3 text-sm text-text-primary">{achievement.name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{achievement.score}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{achievement.type}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{achievement.studentName}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{achievement.teacherName}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{achievement.submitTime}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button 
                          className="text-[#2E7D32] hover:text-[#1B5E20]"
                          onClick={() => handleViewAchievement(achievement.id)}
                        >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-text-muted">
                显示 1-5 条，共 76 条
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className={`px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentPage === 1}
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button 
                  className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 1 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
                <button 
                  className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 2 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(2)}
                >
                  2
                </button>
                <button 
                  className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 3 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(3)}
                >
                  3
                </button>
                <span className="px-2 text-text-muted">...</span>
                <button 
                  className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 16 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                  onClick={() => handlePageChange(16)}
                >
                  16
                </button>
                <button 
                  className={`px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors ${currentPage === 16 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentPage === 16}
                  onClick={() => currentPage < 16 && handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementLibraryManagement;

