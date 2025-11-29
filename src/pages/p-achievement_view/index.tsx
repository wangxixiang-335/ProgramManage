import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { Achievement, User } from '../../types/achievement';
import styles from './styles.module.css';

const AchievementViewPage: React.FC = () => {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 设置页面标题并加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果查看';
    
    // 加载所有学生的成果
    loadAllStudentAchievements();
    
    return () => { document.title = originalTitle; };
  }, []);

  // 加载所有学生的成果数据
  const loadAllStudentAchievements = async () => {
    try {
      setIsLoading(true);
      
      // 获取当前用户ID（这里应该从登录状态获取，暂时使用教师ID）
      const currentUserId = '7a482e3f-93c3-467c-9f4a-7fea2084b093'; // tyj, role=2 (教师)
      
      // 获取当前用户信息
      const userResult = await AchievementService.getCurrentUser(currentUserId);
      if (userResult.success && userResult.data) {
        setCurrentUser(userResult.data);
        console.log('👤 当前用户:', userResult.data);
        
        // 如果是教师 (role=2)，查看所有学生成果
        if (userResult.data.role === 2) {
          const achievementsResult = await AchievementService.getAchievementsByRole(2); // role=2 是教师，获取所有学生成果
          if (achievementsResult.success) {
            setAchievements(achievementsResult.data || []);
            console.log('📊 学生成果加载成功:', achievementsResult.data?.length, '条');
          } else {
            console.error('加载学生成果失败:', achievementsResult.message);
          }
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
    const matchesType = !searchFilters.type || achievement.achievement_types?.name?.includes(searchFilters.type);
    const matchesName = !searchFilters.name || achievement.title.toLowerCase().includes(searchFilters.name.toLowerCase());
    const matchesStudent = !searchFilters.student || achievement.users?.username?.toLowerCase().includes(searchFilters.student.toLowerCase());
    return matchesType && matchesName && matchesStudent;
  });

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (itemId: string) => {
    setActiveNavItem(itemId);
  };

  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };

  // 状态样式映射
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'published':
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
      case 'published':
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
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                    >
                      <option value="">全部类型</option>
                      <option value="项目报告">项目报告</option>
                      <option value="论文">论文</option>
                      <option value="软件作品">软件作品</option>
                      <option value="实验报告">实验报告</option>
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
                        <th className="text-left py-4 px-6 font-medium text-text-primary">成果信息</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">学生</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">类型</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">提交时间</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">状态</th>
                        <th className="text-center py-4 px-6 font-medium text-text-primary">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAchievements.map((achievement) => (
                        <tr key={achievement.id} className="border-b border-border-light hover:bg-bg-gray transition-all">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              {achievement.cover_url && (
                                <img 
                                  src={achievement.cover_url} 
                                  alt={achievement.title}
                                  className="w-16 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-text-primary line-clamp-1">{achievement.title}</h4>
                                {achievement.description && (
                                  <p className="text-sm text-text-muted line-clamp-1">
                                    {achievement.description.replace(/<[^>]*>/g, '')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-bg-gray rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-text-muted text-sm"></i>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  {achievement.users?.username || '未知学生'}
                                </p>
                                <p className="text-xs text-text-muted">
                                  {achievement.users?.email || ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-text-secondary">
                              {achievement.achievement_types?.name || '未分类'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-text-secondary">
                              {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(achievement.status)}`}>
                              {getStatusText(achievement.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementViewPage;