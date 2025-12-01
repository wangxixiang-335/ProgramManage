

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface Achievement {
  id: string;
  title: string;
  status: 'published' | 'reviewing' | 'rejected' | 'draft';
  time: string;
  coverImage?: string;
  rejectionReason?: string;
  hasApprovalHistory?: boolean;
}

const BusinessProcessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [achievementSearchValue, setAchievementSearchValue] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showAiSolutionModal, setShowAiSolutionModal] = useState(false);
  const [showApprovalHistoryModal, setShowApprovalHistoryModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'achievement-1',
      title: '智能校园管理系统',
      status: 'published',
      time: '发布时间：2023-11-15 14:30',
      coverImage: 'https://s.coze.cn/image/cFFMMo4AR10/'
    },
    {
      id: 'achievement-2',
      title: '大数据分析平台',
      status: 'reviewing',
      time: '提交时间：2023-12-05 09:15',
      coverImage: 'https://s.coze.cn/image/KJmyndyDov8/'
    },
    {
      id: 'achievement-3',
      title: '移动学习APP',
      status: 'rejected',
      time: '提交时间：2023-11-28 16:45',
      coverImage: 'https://s.coze.cn/image/kPiKNdCCY1g/',
      rejectionReason: '功能设计不够完善，缺少用户体验测试数据，建议补充详细的测试报告和用户反馈。'
    },
    {
      id: 'achievement-4',
      title: '智能推荐系统',
      status: 'draft',
      time: '最后编辑：2023-12-10 11:20'
    },
    {
      id: 'achievement-5',
      title: '校园社交平台',
      status: 'rejected',
      time: '提交时间：2023-11-20 10:30',
      coverImage: 'https://s.coze.cn/image/zunON49PoaY/',
      rejectionReason: '安全机制不完善，缺少隐私保护措施，建议加强用户数据安全保护。',
      hasApprovalHistory: true
    }
  ]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果管理';
    return () => { document.title = originalTitle; };
  }, []);

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = globalSearchValue;
      console.log('全局搜索:', searchTerm);
      navigate(`/project-intro?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleAchievementSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = achievementSearchValue;
      console.log('成果搜索:', searchTerm);
      filterAchievementsByName(searchTerm);
    }
  };

  const handleStatusFilterClick = (status: string) => {
    setSelectedStatusFilter(status);
    console.log('筛选状态:', status);
    filterAchievementsByStatus(status);
  };

  const handleEditAchievement = (achievementId: string) => {
    console.log('编辑成果:', achievementId);
    // 这里可以添加编辑成果的逻辑，例如跳转到编辑页面
    // navigate(`/achievement-edit?id=${achievementId}`);
  };

  const handleDeleteAchievement = (achievementId: string) => {
    setCurrentDeleteId(achievementId);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (currentDeleteId) {
      console.log('确认删除成果:', currentDeleteId);
      setAchievements(prev => prev.filter(achievement => achievement.id !== currentDeleteId));
      setShowDeleteConfirmModal(false);
      setCurrentDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setCurrentDeleteId(null);
  };

  const handleWithdrawAchievement = (achievementId: string) => {
    console.log('撤回成果:', achievementId);
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, status: 'draft' as const, time: '最后编辑：' + new Date().toLocaleString() }
          : achievement
      )
    );
  };

  const handleAiSolution = (achievementId: string) => {
    console.log('获取AI解决方案:', achievementId);
    setShowAiSolutionModal(true);
  };

  const handleViewApprovalHistory = (achievementId: string) => {
    console.log('查看审批记录:', achievementId);
    setShowApprovalHistoryModal(true);
  };

  const handleApplyAiSolution = () => {
    console.log('采纳AI解决方案');
    setShowAiSolutionModal(false);
  };

  const filterAchievementsByStatus = (status: string) => {
    // 这里可以添加实际的筛选逻辑
    console.log('按状态筛选成果:', status);
  };

  const filterAchievementsByName = (keyword: string) => {
    // 这里可以添加实际的搜索逻辑
    console.log('按名称搜索成果:', keyword);
  };

  const getStatusDisplay = (status: Achievement['status']) => {
    switch (status) {
      case 'published':
        return { text: '已发布', className: 'bg-green-100 text-green-800' };
      case 'reviewing':
        return { text: '审核中', className: 'bg-orange-100 text-orange-800' };
      case 'rejected':
        return { text: '未通过', className: 'bg-red-100 text-red-800' };
      case 'draft':
        return { text: '草稿', className: 'bg-gray-100 text-gray-800' };
      default:
        return { text: '未知', className: 'bg-gray-100 text-gray-800' };
    }
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
                value={globalSearchValue}
                onChange={(e) => setGlobalSearchValue(e.target.value)}
                onKeyPress={handleGlobalSearchKeyPress}
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
              <img 
                src="https://s.coze.cn/image/ZGfcCg_zbjk/" 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">{user?.username || '用户'}</span>
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
                <span className="font-medium">成果发布</span>
              </Link>
            </li>
            <li>
              <Link to="/business-process" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
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
              <button 
                onClick={() => {
                  // 可以在这里添加清除用户登录状态的逻辑
                  navigate('/login');
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500 w-full text-left"
              >
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
              <nav className="text-sm text-text-muted mb-2">
                <Link to="/home" className="hover:text-secondary">首页</Link>
                <span className="mx-2">/</span>
                <span className="text-text-primary">成果管理</span>
              </nav>
              <h2 className="text-2xl font-bold text-text-primary mb-2">成果管理</h2>
              <p className="text-text-secondary">管理和查看您的项目成果，包括编辑、发布和查看状态</p>
            </div>
          </div>
        </div>

        {/* 筛选和搜索区域 */}
        <div className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 状态筛选 */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleStatusFilterClick('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStatusFilter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                全部成果
              </button>
              <button 
                onClick={() => handleStatusFilterClick('published')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStatusFilter === 'published' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                已发布
              </button>
              <button 
                onClick={() => handleStatusFilterClick('reviewing')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStatusFilter === 'reviewing' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                审核中
              </button>
              <button 
                onClick={() => handleStatusFilterClick('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStatusFilter === 'rejected' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                未通过
              </button>
              <button 
                onClick={() => handleStatusFilterClick('draft')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedStatusFilter === 'draft' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-bg-gray text-text-secondary hover:bg-gray-200'
                }`}
              >
                草稿箱
              </button>
            </div>
            
            {/* 搜索功能 */}
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="搜索成果名称..." 
                value={achievementSearchValue}
                onChange={(e) => setAchievementSearchValue(e.target.value)}
                onKeyPress={handleAchievementSearchKeyPress}
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
        </div>

        {/* 成果列表区域 */}
        <div className="space-y-4">
          {achievements.map((achievement) => {
            const statusDisplay = getStatusDisplay(achievement.status);
            
            return (
              <div key={achievement.id} className="bg-bg-light rounded-xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center">
                  {/* 封面图 */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    {achievement.coverImage ? (
                      <img 
                        src={achievement.coverImage} 
                        alt={`${achievement.title}成果封面`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <i className="fas fa-file-alt text-4xl text-gray-300"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* 成果信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-text-primary truncate">{achievement.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.className}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm mb-2">{achievement.time}</p>
                    
                    {/* 驳回原因 */}
                    {achievement.rejectionReason && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg mb-2">
                        <p className="text-red-700 text-sm">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          驳回原因：{achievement.rejectionReason}
                        </p>
                      </div>
                    )}
                    
                    {/* 审批记录 */}
                    {achievement.hasApprovalHistory && (
                      <div className="mb-2">
                        <button 
                          onClick={() => handleViewApprovalHistory(achievement.id)}
                          className="text-orange-500 text-sm hover:underline"
                        >
                          <i className="fas fa-history mr-1"></i>查看审批记录
                        </button>
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-2">
                      {achievement.status === 'reviewing' ? (
                        <button 
                          onClick={() => handleWithdrawAchievement(achievement.id)}
                          className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium hover:bg-yellow-200"
                        >
                          <i className="fas fa-undo mr-1"></i>撤回
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditAchievement(achievement.id)}
                            className="px-3 py-1 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                          >
                            <i className="fas fa-edit mr-1"></i>编辑
                          </button>
                          <button 
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            className="px-3 py-1 rounded-lg bg-red-100 text-red-600 text-sm font-medium hover:bg-red-200"
                          >
                            <i className="fas fa-trash-alt mr-1"></i>删除
                          </button>
                        </>
                      )}
                      
                      {achievement.status === 'rejected' && (
                        <button 
                          onClick={() => handleAiSolution(achievement.id)}
                          className="px-3 py-1 rounded-lg bg-purple-100 text-purple-600 text-sm font-medium hover:bg-purple-200"
                        >
                          <i className="fas fa-robot mr-1"></i>AI解决方案
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* AI解决方案模态框 */}
        {showAiSolutionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">AI解决方案</h3>
                <button 
                  onClick={() => setShowAiSolutionModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">基于驳回原因的解决方案</h4>
                  <p className="text-text-secondary">根据您的项目被驳回的原因，AI建议您从以下几个方面进行改进：</p>
                  <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
                    <li>完善功能设计文档，详细描述每个功能模块的实现方式和交互流程</li>
                    <li>添加用户体验测试环节，收集至少20名用户的反馈意见</li>
                    <li>编写详细的测试报告，包括功能测试、性能测试和兼容性测试结果</li>
                    <li>优化用户界面设计，提高系统的易用性和美观度</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">技术实现建议</h4>
                  <p className="text-text-secondary">针对您的项目类型，AI提供以下技术实现建议：</p>
                  <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
                    <li>使用自动化测试工具如Selenium或Jest进行功能测试</li>
                    <li>采用用户体验测试工具如Hotjar或UserTesting收集用户反馈</li>
                    <li>考虑使用原型设计工具如Figma或Adobe XD创建高保真原型</li>
                    <li>实施敏捷开发方法，分阶段迭代完善项目功能</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleApplyAiSolution}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  采纳建议
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 审批记录模态框 */}
        {showApprovalHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-primary">审批记录</h3>
                <button 
                  onClick={() => setShowApprovalHistoryModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-red-400 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-text-primary">驳回</h4>
                    <span className="text-text-muted text-sm">2023-11-25 15:20</span>
                  </div>
                  <p className="text-text-secondary mt-1">安全机制不完善，缺少隐私保护措施，建议加强用户数据安全保护。</p>
                  <p className="text-text-muted text-sm mt-2">审批人：李教授</p>
                </div>
                <div className="border-l-4 border-orange-400 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-text-primary">审核中</h4>
                    <span className="text-text-muted text-sm">2023-11-22 10:15</span>
                  </div>
                  <p className="text-text-secondary mt-1">项目已提交至评审委员会，正在进行审核。</p>
                  <p className="text-text-muted text-sm mt-2">处理人：王助教</p>
                </div>
                <div className="border-l-4 border-green-400 pl-4 py-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-text-primary">提交成功</h4>
                    <span className="text-text-muted text-sm">2023-11-20 10:30</span>
                  </div>
                  <p className="text-text-secondary mt-1">项目成果已成功提交，等待审核。</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 删除确认模态框 */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <i className="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">确认删除</h3>
                <p className="text-text-secondary">您确定要删除该成果吗？此操作无法撤销。</p>
              </div>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50"
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessProcessPage;

