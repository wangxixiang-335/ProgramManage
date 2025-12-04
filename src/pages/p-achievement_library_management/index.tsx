

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { AchievementType, AchievementWithUsers, User, AchievementAttachment, NUMBER_TO_STATUS } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface AchievementDisplay {
  id: string;
  title: string;
  score?: number;
  type_name?: string;
  student_name: string;
  instructor_name?: string;
  created_at: string;
}

const AchievementLibraryManagement: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('achievements');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // 每页显示10条
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  const [achievements, setAchievements] = useState<AchievementDisplay[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]); // 保存过滤后的原始数据
  const [isSearching, setIsSearching] = useState(false); // 是否正在搜索状态
  const [loading, setLoading] = useState(false);
  
  // 搜索条件状态
  const [searchConditions, setSearchConditions] = useState({
    type_id: '',
    title: '',
    student_name: '',
    score_range: ''
  });

  // 成果详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithUsers | null>(null);
  const [achievementAttachments, setAchievementAttachments] = useState<AchievementAttachment[]>([]);

  // 加载成果类型和成果列表
  useEffect(() => {
    loadInitialData();
  }, []);
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 并行加载数据
      const [typesResult, achievementsResult] = await Promise.all([
        AchievementService.getAchievementTypes(),
        AchievementService.getAllAchievements() // 所有成果
      ]);
      
      if (typesResult.success && typesResult.data) {
        setAchievementTypes(typesResult.data);
      }
      
      if (achievementsResult.success && achievementsResult.data) {
        // 更新总数和页数
        const total = achievementsResult.data.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / pageSize));
        
        // 分页处理
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = achievementsResult.data.slice(startIndex, endIndex);
        
        const displayData = paginatedData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          score: achievement.score,
          type_name: achievement.achievement_types?.name || achievement.achievement_type?.name || '',
          student_name: achievement.users?.role === 1 ? (achievement.users?.full_name || achievement.users?.username) : (achievement.users?.role === 2 ? '无' : (achievement.users?.username || '')),
          instructor_name: achievement.instructor?.full_name || achievement.instructor?.username || '',
          created_at: achievement.created_at
        }));
        setAchievements(displayData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重新加载成果列表
  const loadAchievements = async () => {
    setLoading(true);
    try {
      // 如果正在搜索状态，使用过滤后的数据
      if (isSearching && filteredAchievements.length > 0) {
        const total = filteredAchievements.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / pageSize));
        
        // 分页处理
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredAchievements.slice(startIndex, endIndex);
        
        const displayData = paginatedData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          score: achievement.score,
          type_name: achievement.achievement_types?.name || achievement.achievement_type?.name || '',
          student_name: achievement.users?.role === 1 ? (achievement.users?.full_name || achievement.users?.username) : (achievement.users?.role === 2 ? '无' : (achievement.users?.username || '')),
          instructor_name: achievement.instructor?.full_name || achievement.instructor?.username || '',
          created_at: achievement.created_at
        }));
        setAchievements(displayData);
      } else {
        // 正常加载所有数据
        const result = await AchievementService.getAllAchievements();
        if (result.success && result.data) {
          // 更新总数和页数
          const total = result.data.length;
          setTotalItems(total);
          setTotalPages(Math.ceil(total / pageSize));
          
          // 分页处理
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedData = result.data.slice(startIndex, endIndex);
          
        const displayData = paginatedData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          score: achievement.score,
          type_name: achievement.achievement_types?.name || achievement.achievement_type?.name || '',
          student_name: achievement.users?.role === 1 ? (achievement.users?.full_name || achievement.users?.username) : (achievement.users?.role === 2 ? '无' : (achievement.users?.username || '')),
          instructor_name: achievement.instructor?.full_name || achievement.instructor?.username || '',
          created_at: achievement.created_at
        }));
          setAchievements(displayData);
        }
      }
    } catch (error) {
      console.error('加载成果列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = async () => {
    setLoading(true);
    try {
      // 获取所有成果然后在前端过滤（如果需要更复杂的查询可以修改后端接口）
      const result = await AchievementService.getAllAchievements();
      if (result.success && result.data) {
        let filteredData = result.data;
        
        // 应用过滤条件
        if (searchConditions.type_id) {
          filteredData = filteredData.filter(a => a.type_id === searchConditions.type_id);
        }
        
        if (searchConditions.title) {
          filteredData = filteredData.filter(a => 
            a.title.toLowerCase().includes(searchConditions.title.toLowerCase())
          );
        }
        
        if (searchConditions.score_range) {
          filteredData = filteredData.filter(a => {
            const score = a.score || 0; // 如果没有分数，归为0分（60分以下）
            
            switch (searchConditions.score_range) {
              case '90+':
                return score >= 90;
              case '80-89':
                return score >= 80 && score <= 89;
              case '70-79':
                return score >= 70 && score <= 79;
              case '60-69':
                return score >= 60 && score <= 69;
              case '60-':
                return score < 60 || !a.score; // 60分以下或没有分数
              default:
                return true;
            }
          });
        }
        
        // 需要获取用户信息进行学生姓名过滤
        if (searchConditions.student_name) {
          const achievementsWithUsers = await Promise.all(
            filteredData.map(async (achievement) => {
              const userResult = await AchievementService.getCurrentUser(achievement.publisher_id);
              return {
                ...achievement,
                publisher: userResult.data
              };
            })
          );
          
          filteredData = achievementsWithUsers.filter(a =>
            (a.publisher?.full_name || a.publisher?.username || '').toLowerCase().includes(searchConditions.student_name.toLowerCase())
          );
        }
        
        // 保存过滤后的数据
        setFilteredAchievements(filteredData);
        setIsSearching(true);
        
        // 更新总数和页数
        const total = filteredData.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / pageSize));
        setCurrentPage(1); // 搜索时重置到第一页
        
        // 显示第一页数据
        const startIndex = 0;
        const endIndex = pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        const displayData = paginatedData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          score: achievement.score,
          type_name: achievement.achievement_types?.name || achievement.achievement_type?.name || '',
          student_name: achievement.users?.role === 1 ? (achievement.users?.full_name || achievement.users?.username) : (achievement.users?.role === 2 ? '无' : (achievement.users?.username || '')),
          instructor_name: achievement.instructor?.full_name || achievement.instructor?.username || '',
          created_at: achievement.created_at
        }));
        
        setAchievements(displayData);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // 重置搜索条件
  const handleReset = () => {
    setSearchConditions({
      type_id: '',
      title: '',
      student_name: '',
      score_range: ''
    });
    setIsSearching(false);
    setFilteredAchievements([]);
    setCurrentPage(1);
    loadAchievements(); // 重新加载所有数据
  };



  // 查看成果详情
  const handleViewAchievement = async (achievementId: string) => {
    setLoading(true);
    try {
      // 获取成果详情（包含所有用户信息）
      const result = await AchievementService.getAchievementWithUsersById(achievementId);
      if (result.success && result.data) {
        setSelectedAchievement(result.data);
        
        // 获取成果附件
        const attachmentsResult = await AchievementService.getAchievementAttachments(achievementId);
        if (attachmentsResult.success) {
          setAchievementAttachments(attachmentsResult.data || []);
        }
        
        setShowDetailModal(true);
      } else {
        alert('获取成果详情失败: ' + result.message);
      }
    } catch (error) {
      console.error('查看成果失败:', error);
      alert('查看成果失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除成果
  const handleDeleteAchievement = async (achievementId: string) => {
    if (confirm('确定要删除这个成果吗？')) {
      try {
        const result = await AchievementService.deleteAchievement(achievementId);
        if (result.success) {
          alert('删除成功');
          
          // 如果正在搜索状态，从过滤数据中移除
          if (isSearching) {
            const newFilteredData = filteredAchievements.filter(a => a.id !== achievementId);
            setFilteredAchievements(newFilteredData);
            
            // 更新总数
            const total = newFilteredData.length;
            setTotalItems(total);
            setTotalPages(Math.ceil(total / pageSize));
            
            // 如果当前页已经没有数据且不是第一页，则返回上一页
            if (achievements.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
            } else {
              loadAchievements(); // 否则重新加载当前页
            }
          } else {
            loadAchievements(); // 重新加载列表
          }
        } else {
          alert('删除失败: ' + result.message);
        }
      } catch (error) {
        console.error('删除成果失败:', error);
        alert('删除失败');
      }
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 当页码改变时重新加载数据
  useEffect(() => {
    if (currentPage > 0) {
      loadAchievements();
    }
  }, [currentPage]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 类型选择 */}
              <div className="space-y-2">
                <label htmlFor="type-select" className="block text-sm font-medium text-text-secondary">类型</label>
                <select 
                  id="type-select" 
                  value={searchConditions.type_id}
                  onChange={(e) => setSearchConditions({...searchConditions, type_id: e.target.value})}
                  className={`w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent ${styles.customSelect}`}
                >
                  <option value="">全部类型</option>
                  {achievementTypes.map(type => (
                    <option key={type.id} value={type.id}>
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
                  value={searchConditions.score_range}
                  onChange={(e) => setSearchConditions({...searchConditions, score_range: e.target.value})}
                  className={`w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent ${styles.customSelect}`}
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
                  value={searchConditions.title}
                  onChange={(e) => setSearchConditions({...searchConditions, title: e.target.value})}
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
                  value={searchConditions.student_name}
                  onChange={(e) => setSearchConditions({...searchConditions, student_name: e.target.value})}
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
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary">成果列表</h3>
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        加载中...
                      </td>
                    </tr>
                  ) : achievements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    achievements.map((achievement) => (
                      <tr key={achievement.id} className={`border-t border-border-light ${styles.tableRowHover}`}>
                        <td className="px-4 py-3 text-sm text-text-primary">{achievement.title}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{achievement.score || '-'}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{achievement.type_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{achievement.student_name}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{achievement.instructor_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {new Date(achievement.created_at).toLocaleDateString()}
                        </td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-text-muted">
                显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className={`px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentPage === 1}
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                
                {/* 动态生成页码按钮 */}
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5; // 最多显示5个页码
                  
                  if (totalPages <= maxVisiblePages) {
                    // 如果总页数小于等于最大显示页数，显示所有页码
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <button 
                          key={i}
                          className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === i ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(i)}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // 如果总页数较多，智能显示页码
                    if (currentPage <= 3) {
                      // 当前页在前面，显示1...3...
                      for (let i = 1; i <= 3; i++) {
                        pages.push(
                          <button 
                            key={i}
                            className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === i ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis1" className="px-2 text-text-muted">...</span>);
                      pages.push(
                        <button 
                          key={totalPages}
                          className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === totalPages ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    } else if (currentPage >= totalPages - 2) {
                      // 当前页在后面，显示...最后3页
                      pages.push(
                        <button 
                          key={1}
                          className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 1 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis2" className="px-2 text-text-muted">...</span>);
                      for (let i = totalPages - 2; i <= totalPages; i++) {
                        pages.push(
                          <button 
                            key={i}
                            className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === i ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // 当前页在中间，显示1...当前-1,当前,当前+1...最后页
                      pages.push(
                        <button 
                          key={1}
                          className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === 1 ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis3" className="px-2 text-text-muted">...</span>);
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(
                          <button 
                            key={i}
                            className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === i ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis4" className="px-2 text-text-muted">...</span>);
                      pages.push(
                        <button 
                          key={totalPages}
                          className={`px-3 py-1 border rounded-lg transition-colors ${currentPage === totalPages ? 'border-[#2E7D32] bg-[#2E7D32] text-white' : 'border-border-light text-text-secondary hover:bg-gray-50'}`}
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
                
                <button 
                  className={`px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={currentPage === totalPages}
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
            {/* 成果详情弹窗 */}
      {showDetailModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* 弹窗标题栏 */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-text-primary">成果详情</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* 内容区域 */}
            <div className="p-6">
              {/* 1. 成果详情 - 基本信息 */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b">成果详情</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">成果名称</label>
                    <div className="text-base text-text-primary font-medium">{selectedAchievement.title}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">成果类型</label>
                    <div className="text-base text-text-primary">{selectedAchievement.achievement_type?.name || selectedAchievement.type?.name || '-'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">学生姓名</label>
                    <div className="text-base text-text-primary">
                      {selectedAchievement.publisher?.role === 1 ? (selectedAchievement.publisher?.full_name || selectedAchievement.publisher?.username) : 
                       selectedAchievement.publisher?.role === 2 ? '无' : (selectedAchievement.publisher?.username || '')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">指导教师</label>
                    <div className="text-base text-text-primary">{selectedAchievement.instructor?.full_name || selectedAchievement.instructor?.username || ''}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">状态</label>
                    <div className="text-base">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedAchievement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedAchievement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedAchievement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAchievement.status === 'approved' ? '已通过' :
                         selectedAchievement.status === 'pending' ? '待审核' :
                         selectedAchievement.status === 'rejected' ? '已拒绝' : '草稿'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">评分</label>
                    <div className="text-base text-text-primary font-medium">{selectedAchievement.score || '-'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">提交时间</label>
                    <div className="text-base text-text-primary">
                      {new Date(selectedAchievement.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">协作者</label>
                    <div className="text-base text-text-primary">{selectedAchievement.parent?.full_name || selectedAchievement.parent?.username || '-'}</div>
                  </div>
                </div>
              </div>

              {/* 2. 封面图片 - 占满整个横向详情页面 */}
              {selectedAchievement.cover_url && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b">封面图片</h4>
                  <div className="w-full border rounded-lg overflow-hidden">
                    <img 
                      src={selectedAchievement.cover_url} 
                      alt="封面图" 
                      className="w-full h-auto max-h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 3. 成果描述 - 富文本解析图片 */}
              {selectedAchievement.description && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b">成果描述</h4>
                  <div className="border rounded-lg p-4 bg-gray-50 text-text-primary">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedAchievement.description.replace(
                          /<img([^>]*)src="([^"]*)"([^>]*)>/g,
                          '<img$1src="$2"$3 style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0;" />'
                        )
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 4. 演示视频 */}
              {selectedAchievement.video_url && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b">演示视频</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <video 
                      src={selectedAchievement.video_url}
                      controls
                      className="w-full h-auto max-h-96"
                    >
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                </div>
              )}

              {/* 5. 附件 */}
              {achievementAttachments.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b">附件</h4>
                  <div className="space-y-2">
                    {achievementAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-paperclip text-gray-500"></i>
                          <span className="text-sm text-text-primary font-medium">{attachment.file_name}</span>
                          <span className="text-xs text-text-muted bg-gray-200 px-2 py-1 rounded">
                            {attachment.file_type || 'file'}
                          </span>
                        </div>
                        <button 
                          className="px-3 py-1 text-[#2E7D32] hover:text-[#1B5E20] bg-green-50 hover:bg-green-100 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                          onClick={() => window.open(attachment.file_url, '_blank')}
                        >
                          <i className="fas fa-download"></i>
                          <span>查看</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 关闭按钮 */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <button 
                className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
                onClick={() => setShowDetailModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementLibraryManagement;

