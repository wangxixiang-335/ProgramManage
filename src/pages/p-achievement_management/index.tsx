import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { Achievement, User, AchievementType } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import { useApproval } from '../../contexts/ApprovalContext';
import styles from './styles.module.css';



const AchievementManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingCount } = useApproval();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 设置页面标题并加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果管理';
    
    // 加载当前用户的成果和类型数据
    loadUserAchievements();
    loadAchievementTypes();
    
    return () => { document.title = originalTitle; };
  }, []);

  // 加载用户成果数据
  const loadUserAchievements = async () => {
    try {
      setIsLoading(true);
      
      // 获取当前用户ID
      const currentUserId = String(user?.id || '');
      
      // 获取当前用户信息
      const userResult = await AchievementService.getCurrentUser(currentUserId);
      if (userResult.success && userResult.data) {
        setCurrentUser(userResult.data);
        console.log('👤 当前用户:', userResult.data);
        
        // 获取教师自己发布的成果 (role=2)
        if (userResult.data.role === 2) {
          const achievementsResult = await AchievementService.getAchievementsByUser(userResult.data.role, currentUserId);
          if (achievementsResult.success) {
            setAchievements(achievementsResult.data || []);
            console.log('📊 教师自己发布的成果加载成功:', achievementsResult.data?.length, '条');
          } else {
            console.error('加载教师成果失败:', achievementsResult.message);
          }
        }
      }
    } catch (error) {
      console.error('加载用户成果失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索逻辑
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  // 搜索处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 获取类型样式
  const getTypeStyle = (typeName: string) => {
    switch (typeName) {
      case '网站开发':
        return 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full';
      case '数据分析':
        return 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full';
      case '游戏开发':
        return 'px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full';
      case '移动应用':
        return 'px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full';
      case '办公应用':
        return 'px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full';
      case '创意作品':
        return 'px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full';
      case '人工智能':
        return 'px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full';
      case '其他':
      default:
        return 'px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full';
    }
  };

  // 加载成果类型
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

  // 编辑成果
  const handleEditAchievement = (achievementId: string) => {
    navigate(`/achievement-edit/${achievementId}`);
  };

  // 删除成果
  const handleDeleteAchievement = async (achievementId: string) => {
    if (confirm('确定要删除该成果吗？此操作不可恢复。')) {
      try {
        const result = await AchievementService.deleteAchievement(achievementId);
        
        if (result.success) {
          setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));
          console.log('删除成功');
        } else {
          console.error('删除失败:', result.message);
          alert('删除失败: ' + result.message);
        }
      } catch (error) {
        console.error('删除过程中出错:', error);
        alert('删除过程中出错');
      }
    }
  };

  // 状态样式映射
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
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
        return '已发布';
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
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{pendingCount}</span>
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
          </nav>
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
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/Iy4-k7r4TIc/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{user?.full_name || '教师'}</p>
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
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                    <input
                      type="text"
                      placeholder="搜索成果..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
                    />
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
                  <p className="text-text-muted">暂无成果</p>
                  <p className="text-sm text-text-muted mt-2">
                    {searchTerm ? '尝试调整搜索条件' : '点击"成果发布"创建第一个成果'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border-light">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">成果</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">类型</th>
                        <th className="text-left py-4 px-6 font-medium text-text-primary">发布时间</th>
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
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {(() => {
                              const type = achievementTypes.find(t => t.id === achievement.type_id);
                              const typeName = type?.name || '其他';
                              return (
                                <span className={getTypeStyle(typeName)}>
                                  {typeName}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-text-secondary">
                              {new Date(achievement.created_at || '').toLocaleDateString('zh-CN')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(achievement.status)}`}>
                              {getStatusText(achievement.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEditAchievement(achievement.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                编辑
                              </button>
                              <span className="text-text-muted">|</span>
                              <button
                                onClick={() => handleDeleteAchievement(achievement.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                删除
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

export default AchievementManagement;