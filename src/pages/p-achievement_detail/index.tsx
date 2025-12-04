import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { AchievementWithUsers, User, AchievementStatus } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const AchievementDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // 从URL参数获取成果ID
  const achievementId = searchParams.get('id');
  
  // 获取当前用户ID
  const currentUserId = user?.id || '';
  
  // 页面状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [achievement, setAchievement] = useState<AchievementWithUsers | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果查看';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);
  
  // 检查URL参数并加载成果详情
  useEffect(() => {
    if (achievementId) {
      loadAchievementDetail(achievementId);
      loadCurrentUser();
    }
  }, [achievementId]);
  
  const loadCurrentUser = async () => {
    try {
      const userResult = await AchievementService.getCurrentUser(currentUserId);
      if (userResult.success && userResult.data) {
        setCurrentUser(userResult.data);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };
  
  const loadAchievementDetail = async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      const result = await AchievementService.getAchievementWithUsersById(id);
      
      if (result.success && result.data) {
        setAchievement(result.data);
        setShowDetailModal(true);
      } else {
        alert('获取成果详情失败：' + (result.message || '未知错误'));
        // 清除URL参数
        navigate('/achievement-detail', { replace: true });
      }
    } catch (error) {
      console.error('加载成果详情失败:', error);
      alert('加载成果详情失败');
      navigate('/achievement-detail', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // 通知按钮点击
  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };
  
  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setAchievement(null);
    // 清除URL参数
    navigate('/achievement-detail', { replace: true });
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
  
  // 获取状态样式
  const getStatusStyle = (status: AchievementStatus) => {
    switch (status) {
      case 'pending':
        return 'px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full';
      case 'approved':
        return 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full';
      case 'rejected':
        return 'px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full';
      case 'draft':
      default:
        return 'px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full';
    }
  };
  
  // 模态框外部点击关闭
  const handleModalBackdropClick = (e: React.MouseEvent, closeModal: () => void) => {
    if (e.target === e.currentTarget) {
      closeModal();
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
                  <span className="ml-3 font-medium">数据看板</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-approval" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-tasks w-6 text-center"></i>
                  <span className="ml-3">成果审批</span>
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
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果查看</h2>
              
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
                    src="https://s.coze.cn/image/W9aKtpJZs9s/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{user?.full_name || '教师用户'}</p>
                    <p className="text-xs text-text-muted">计算机科学与技术系</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* 内容区域 */}
          <div className="p-6">
            <div className={`bg-white rounded-xl shadow-card p-8 ${styles.fadeIn}`}>
              <div className="text-center">
                <i className="fas fa-search text-6xl text-gray-300 mb-6"></i>
                <h3 className="text-xl font-semibold text-text-primary mb-2">请先从成果列表中查看详情</h3>
                <p className="text-text-muted mb-6">请先访问成果查看页面，然后点击任意成果的"查看详情"按钮</p>
                <Link 
                  to="/achievement-view"
                  className="inline-flex items-center px-6 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  <i className="fas fa-list mr-2"></i>
                  前往成果列表
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* 成果详情模态框 */}
      {showDetailModal && achievement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => handleModalBackdropClick(e, handleCloseDetailModal)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 模态框头部 */}
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <h3 className="text-xl font-semibold text-text-primary">
                成果详情: {achievement.title}
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
                      <p className="text-text-primary font-medium">{achievement.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">成果类型</p>
                      <span className={getTypeStyle(achievement.type?.name || '其他')}>
                        {achievement.type?.name || '其他'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">发布学生</p>
                      <p className="text-text-primary">
                        {achievement.publisher?.username} ({achievement.publisher?.email})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">指导老师</p>
                      <p className="text-text-primary">
                        {achievement.instructor?.username || '未指定'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">当前状态</p>
                      <span className={getStatusStyle(achievement.status)}>
                        {achievement.status === 'pending' ? '待审核' : 
                         achievement.status === 'approved' ? '已通过' : 
                         achievement.status === 'rejected' ? '已拒绝' : '草稿'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">评分</p>
                      <p className="text-text-primary font-medium">
                        {achievement.score !== null && achievement.score !== undefined ? (
                          <span className={`font-bold ${
                            achievement.score >= 90 ? 'text-green-600' :
                            achievement.score >= 80 ? 'text-blue-600' :
                            achievement.score >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {achievement.score} 分
                          </span>
                        ) : (
                          <span className="text-text-muted">未评分</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">提交时间</p>
                      <p className="text-text-primary">
                        {new Date(achievement.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    {achievement.parent?.username && (
                      <div>
                        <p className="text-sm text-text-muted mb-1">合作伙伴</p>
                        <p className="text-text-primary">
                          {achievement.parent.username}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 封面图片 */}
                {achievement.cover_url && (
                  <div>
                    <h4 className="text-lg font-medium text-text-primary mb-4">封面图片</h4>
                    <div className="bg-bg-gray p-4 rounded-lg">
                      <img 
                        src={achievement.cover_url} 
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
                        __html: achievement.description || '<p class="text-text-muted">暂无描述内容</p>' 
                      }}
                    />
                  </div>
                </div>
                
                {/* 演示视频 */}
                {achievement.video_url && (
                  <div>
                    <h4 className="text-lg font-medium text-text-primary mb-4">演示视频</h4>
                    <div className="bg-bg-gray p-4 rounded-lg">
                      <video 
                        controls 
                        className="w-full max-w-md h-auto rounded-lg mx-auto"
                        src={achievement.video_url}
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

export default AchievementDetailPage;