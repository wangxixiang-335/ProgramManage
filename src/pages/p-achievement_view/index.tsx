import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { Achievement, User, AchievementWithUsers, AchievementType } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const AchievementViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('view-link');
  const [searchFilters, setSearchFilters] = useState({
    class: '',
    type: '',
    score: '',
    name: '',
    student: ''
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // 模态框状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementWithUsers | null>(null);
  const [currentAchievementId, setCurrentAchievementId] = useState<string | null>(null);

  // 设置页面标题并加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果查看';
    
    // 加载初始数据
    loadInitialData();
    
    return () => { document.title = originalTitle; };
  }, []);

  // 监听筛选条件变化，重新计算分页
  useEffect(() => {
    const filteredCount = filteredAchievements.length;
    const newTotalPages = Math.ceil(filteredCount / itemsPerPage);
    setTotalPages(newTotalPages);
    // 如果当前页超过了新的总页数，重置到第一页
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchFilters, achievements, itemsPerPage]);
  
  // 加载初始数据
  const loadInitialData = async () => {
    // 加载成果类型
    try {
      const typesResult = await AchievementService.getAchievementTypes();
      if (typesResult.success && typesResult.data) {
        setAchievementTypes(typesResult.data);
      }
    } catch (error) {
      console.error('加载成果类型失败:', error);
    }
    
    // 加载学生成果
    await loadAllStudentAchievements();
  };

  // 加载所有学生的成果数据
  const loadAllStudentAchievements = async () => {
    try {
      setIsLoading(true);
      
      // 获取当前用户ID
      const currentUserId = String(user?.id || '');
      
      // 获取当前用户信息
      const userResult = await AchievementService.getCurrentUser(currentUserId);
      if (userResult.success && userResult.data) {
        setCurrentUser(userResult.data);
        console.log('👤 当前用户:', userResult.data);
        
        // 如果是学生 (role=1)，查看自己的成果
        if (userResult.data.role === 1) {
          const achievementsResult = await AchievementService.getAchievementsByUser(userResult.data.role, currentUserId);
          if (achievementsResult.success) {
            const allAchievements = achievementsResult.data || [];
            setAchievements(allAchievements);
            // 计算总页数
            setTotalPages(Math.ceil(allAchievements.length / itemsPerPage));
            // 重置到第一页
            setCurrentPage(1);
            console.log('📊 学生自己成果加载成功:', allAchievements.length, '条');
          } else {
            console.error('加载学生成果失败:', achievementsResult.message);
          }
        } else if (userResult.data.role === 2) {
          // 如果是教师 (role=2)，查看所有学生成果
          const achievementsResult = await AchievementService.getAchievementsByRole(2); // role=2 是教师，获取所有学生成果
          if (achievementsResult.success) {
            const allAchievements = achievementsResult.data || [];
            setAchievements(allAchievements);
            // 计算总页数
            setTotalPages(Math.ceil(allAchievements.length / itemsPerPage));
            // 重置到第一页
            setCurrentPage(1);
            console.log('📊 所有学生成果加载成功:', allAchievements.length, '条');
          } else {
            console.error('加载学生成果失败:', achievementsResult.message);
          }
        } else {
          // 其他角色无权限
          alert('无权限访问此页面');
          navigate('/home');
          return;
        }
      }
    } catch (error) {
      console.error('加载学生成果失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 筛选和搜索逻辑
  const filteredAchievements = achievements.filter(achievement => {
    const matchesType = !searchFilters.type || (achievement as any).achievement_types?.name?.includes(searchFilters.type);
    const matchesName = !searchFilters.name || achievement.title.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesStudent = !searchFilters.student || (achievement as any).users?.username?.toLowerCase().includes(searchFilters.student.toLowerCase());
    return matchesType && matchesName && matchesStudent;
  });

  // 分页逻辑
  const getPaginatedAchievements = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAchievements.slice(startIndex, endIndex);
  };

  // 分页控制函数
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (itemId: string) => {
    setActiveNavItem(itemId);
  };

  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };

  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setCurrentAchievement(null);
    setCurrentAchievementId(null);
  };

  // 模态框外部点击关闭
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseDetailModal();
    }
  };

  // 查看成果详情
  const handleViewDetail = async (achievementId: string) => {
    setCurrentAchievementId(achievementId);
    
    // 获取详细的成果信息
    const result = await AchievementService.getAchievementWithUsersById(achievementId);
    if (result.success && result.data) {
      setCurrentAchievement(result.data);
      setShowDetailModal(true);
    } else {
      alert('获取成果详情失败：' + (result.message || '未知错误'));
    }
  };

  // 状态样式映射
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'pending':
        return '审核中';
      case 'rejected':
        return '已拒绝';
      case 'draft':
        return '草稿';
      default:
        return '未知';
    }
  };

  return (
    <div className={styles.pageWrapper}>
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
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3">成果管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-view" 
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                >
                  <i className="fas fa-eye w-6 text-center"></i>
                  <span className="ml-3 font-medium">成果查看</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* 底部导航 */}
          <div className="mt-auto p-4 border-t border-border-light">
            <ul>
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
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果查看</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="text-text-secondary hover:text-secondary">
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/Iy4-k7r4TIc/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{currentUser?.username || '教师用户'}</p>
                    <p className="text-xs text-text-muted">计算机科学与技术系</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* 内容区域 */}
          <div className="p-6">
            {/* 搜索和筛选栏 */}
            <div className="bg-white rounded-xl shadow-card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* 搜索框 */}
                <div className="flex flex-1 space-x-4">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-sm font-medium text-text-secondary mb-1">成果名称</label>
                    <div className="relative">
                      <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                      <input
                        type="text"
                        placeholder="搜索成果名称..."
                        value={searchFilters.name}
                        onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-xs">
                    <label className="block text-sm font-medium text-text-secondary mb-1">学生姓名</label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                      <input
                        type="text"
                        placeholder="搜索学生..."
                        value={searchFilters.student}
                        onChange={(e) => setSearchFilters({...searchFilters, student: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-xs">
                    <label className="block text-sm font-medium text-text-secondary mb-1">成果类型</label>
                    <select
                      value={searchFilters.type}
                      onChange={(e) => setSearchFilters({...searchFilters, type: e.target.value})}
                      className={`w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all ${styles.customSelect}`}
                    >
                      <option value="">全部类型</option>
                      {achievementTypes.map(type => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 成果列表 */}
            <div className="bg-white rounded-xl shadow-card">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <i className="fas fa-spinner fa-spin text-secondary text-2xl mr-3"></i>
                  <span className="text-text-secondary">加载中...</span>
                </div>
              ) : filteredAchievements.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-folder-open text-4xl text-text-muted mb-4"></i>
                  <p className="text-text-muted">暂无学生成果</p>
                  <p className="text-sm text-text-muted mt-2">
                    {Object.values(searchFilters).some(v => v) ? '尝试调整搜索条件' : '还没有学生提交成果'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border-light">
                      <tr>
                        <th className="text-left py-4 px-4 font-medium text-text-primary w-2/12">成果信息</th>
                        <th className="text-left py-4 px-4 font-medium text-text-primary w-2/12">学生</th>
                        <th className="text-left py-4 px-4 font-medium text-text-primary w-2/12">类型</th>
                        <th className="text-left py-4 px-4 font-medium text-text-primary w-2/12">提交时间</th>
                        <th className="text-left py-4 px-4 font-medium text-text-primary w-2/12">状态</th>
                        <th className="text-center py-4 px-4 font-medium text-text-primary w-2/12">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedAchievements().map((achievement) => (
                        <tr key={achievement.id} className="border-b border-border-light hover:bg-bg-gray transition-all">
                          <td className="py-4 px-4 w-2/12">
                            <div className="flex items-center space-x-3">
                              {achievement.cover_url && (
                                <img 
                                  src={achievement.cover_url} 
                                  alt={achievement.title}
                                  className="w-12 h-10 object-cover rounded-lg"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-text-primary text-sm truncate">{achievement.title}</h4>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 w-2/12">
                            <div>
                              <p className="text-sm font-medium text-text-primary truncate">
                                {(achievement as any).users?.full_name || (achievement as any).users?.username || '未知学生'}
                              </p>
                              <p className="text-xs text-text-muted truncate">
                                {(achievement as any).users?.email || ''}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 w-2/12">
                            <span className="text-sm text-text-secondary truncate block">
                              {(achievement as any).achievement_types?.name || '未分类'}
                            </span>
                          </td>
                          <td className="py-4 px-4 w-2/12">
                            <span className="text-sm text-text-secondary truncate block">
                              {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </td>
                          <td className="py-4 px-4 w-2/12">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(achievement.status)}`}>
                              {getStatusText(achievement.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 w-2/12">
                            <div className="flex items-center justify-center">
                              <button 
                                onClick={() => handleViewDetail(achievement.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                查看详情
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* 分页组件 */}
              {filteredAchievements.length > 0 && (
                <div className="px-6 py-4 border-t border-border-light">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                      显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAchievements.length)} 条，
                      共 {filteredAchievements.length} 条成果
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          currentPage === 1
                            ? 'border-border-light text-text-muted cursor-not-allowed'
                            : 'border-border-light text-text-primary hover:bg-bg-gray'
                        }`}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      
                      {/* 页码显示 */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            currentPage === page
                              ? 'bg-secondary text-white border-secondary'
                              : 'border-border-light text-text-primary hover:bg-bg-gray'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          currentPage === totalPages
                            ? 'border-border-light text-text-muted cursor-not-allowed'
                            : 'border-border-light text-text-primary hover:bg-bg-gray'
                        }`}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* 成果详情模态框 */}
      {showDetailModal && currentAchievement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 模态框头部 */}
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <h3 className="text-xl font-semibold text-text-primary">
                成果详情: {currentAchievement.title}
              </h3>
              <button 
                onClick={handleCloseDetailModal}
                className="text-text-muted hover:text-text-primary"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {/* 模态框内容 */}
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-6">
                {/* 成果基本信息 */}
                <div>
                  <h4 className="text-lg font-medium text-text-primary mb-4">成果信息</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-gray p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-text-muted mb-1">成果名称</p>
                      <p className="text-text-primary font-medium">{currentAchievement.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">成果类型</p>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {currentAchievement.type?.name || '其他'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">发布学生</p>
                      <p className="text-text-primary">
                        {currentAchievement.publisher?.full_name || currentAchievement.publisher?.username} ({currentAchievement.publisher?.email})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">指导老师</p>
                      <p className="text-text-primary">
                        {currentAchievement.instructor?.full_name || currentAchievement.instructor?.username || '未指定'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">当前状态</p>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {currentAchievement.status === 'pending' ? '待审核' : 
                         currentAchievement.status === 'approved' ? '已通过' : 
                         currentAchievement.status === 'rejected' ? '已拒绝' : '草稿'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">评分</p>
                      <p className="text-text-primary font-medium">
                        {currentAchievement.score !== null && currentAchievement.score !== undefined ? (
                          <span className={`font-bold ${
                            currentAchievement.score >= 90 ? 'text-green-600' :
                            currentAchievement.score >= 80 ? 'text-blue-600' :
                            currentAchievement.score >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {currentAchievement.score} 分
                          </span>
                        ) : (
                          <span className="text-text-muted">未评分</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">提交时间</p>
                      <p className="text-text-primary">
                        {new Date(currentAchievement.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    {currentAchievement.parent?.username && (
                      <div>
                        <p className="text-sm text-text-muted mb-1">合作伙伴</p>
                        <p className="text-text-primary">
                          {currentAchievement.parent?.full_name || currentAchievement.parent.username}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 封面图片 */}
                {currentAchievement.cover_url && (
                  <div>
                    <h4 className="text-lg font-medium text-text-primary mb-4">封面图片</h4>
                    <div className="bg-bg-gray p-4 rounded-lg">
                      <img 
                        src={currentAchievement.cover_url} 
                        alt="成果封面" 
                        className="w-full max-w-md h-auto rounded-lg shadow-md mx-auto"
                      />
                    </div>
                  </div>
                )}
                
                {/* 成果内容 */}
                <div>
                  <h4 className="text-lg font-medium text-text-primary mb-4">成果描述</h4>
                  <div className="bg-bg-gray p-4 rounded-lg">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: currentAchievement.description || '<p class="text-text-muted">暂无描述内容</p>' 
                      }}
                    />
                  </div>
                </div>
                
                {/* 演示视频 */}
                {currentAchievement.video_url && (
                  <div>
                    <h4 className="text-lg font-medium text-text-primary mb-4">演示视频</h4>
                    <div className="bg-bg-gray p-4 rounded-lg">
                      <video 
                        controls 
                        className="w-full max-w-md h-auto rounded-lg mx-auto"
                        src={currentAchievement.video_url}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 模态框底部 */}
            <div className="p-6 border-t border-border-light flex justify-end">
              <button 
                onClick={handleCloseDetailModal}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
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

export default AchievementViewPage;