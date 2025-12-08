

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AchievementService } from '../../lib/achievementService';
import { AchievementWithUsers, AchievementStatus, ApprovalFilters, AchievementType } from '../../types/achievement';
import { useAuth } from '../../contexts/AuthContext';
import { useApproval } from '../../contexts/ApprovalContext';
import styles from './styles.module.css';

const AchievementApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const { pendingCount, refreshPendingCount } = useApproval();
  const [currentUser, setCurrentUser] = useState(user);
  
  // 获取当前教师ID
  const [currentInstructorId] = useState(() => {
    const userId = user?.id || localStorage.getItem('userId');
    return userId ? String(userId) : '';
  });
  
  // 状态管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [currentAchievementId, setCurrentAchievementId] = useState<string | null>(null);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementWithUsers | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [score, setScore] = useState('');
  
  // 数据状态
  const [achievements, setAchievements] = useState<AchievementWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [achievementTypes, setAchievementTypes] = useState<AchievementType[]>([]);
  
  // 搜索条件状态
  const [classFilter, setClassFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<AchievementStatus>('pending');
  
  // 加载当前用户信息
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUserId = String(user?.id || '');
        if (currentUserId) {
          const userResult = await AchievementService.getCurrentUser(currentUserId);
          if (userResult.success && userResult.data) {
            setCurrentUser(userResult.data);
          }
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
      }
    };

    loadCurrentUser();
  }, [user]);

  // 加载初始数据
  useEffect(() => {
    loadAchievementTypes();
    refreshPendingCount(); // 刷新待审批数量
  }, [currentInstructorId]); // 当教师ID变化时重新加载
  
  // 加载成果数据
  useEffect(() => {
    loadAchievements();
    refreshPendingCount(); // 刷新页面时也更新待审批数量
  }, [currentPage, statusFilter]);
  
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
  


  const loadAchievements = async () => {
    setIsLoading(true);
    
    try {
      if (!currentInstructorId) {
        console.error('❌ 教师ID为空，无法加载数据');
        setAchievements([]);
        setTotal(0);
        return;
      }
      
      const filters: ApprovalFilters = {
        status: statusFilter,
        page: currentPage,
        limit: pageSize
      };
      
      const result = await AchievementService.getAchievementsForInstructor(currentInstructorId, filters);
      
      if (result.success && result.data) {
        setAchievements(result.data);
        setTotal(result.total || 0);
      } else {
        console.error('Failed to load achievements:', result.message);
        // 如果数据库中没有数据，使用空数组
        setAchievements([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果审批';
    return () => { document.title = originalTitle; };
  }, []);
  
  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // 通知按钮点击

  
  // 搜索功能
  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      const filters: ApprovalFilters = {
        title: nameFilter.trim() || undefined,
        student_name: studentFilter.trim() || undefined,
        type_id: typeFilter || undefined,
        class_id: classFilter || undefined,
        status: statusFilter,
        page: 1,
        limit: pageSize
      };
      
      const result = await AchievementService.getAchievementsForInstructor(currentInstructorId, filters);
      
      if (result.success && result.data) {
        setAchievements(result.data);
        setTotal(result.total || 0);
        setCurrentPage(1);
      } else {
        alert('搜索失败：' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('搜索失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 清除搜索条件
  const handleClearFilters = () => {
    setClassFilter('');
    setTypeFilter('');
    setNameFilter('');
    setStudentFilter('');
    setCurrentPage(1);
  };
  
  // 批改按钮点击
  const handleReviewClick = async (achievement: AchievementWithUsers) => {
    setCurrentAchievementId(achievement.id);
    
    try {
      // 获取详细的成果信息
      const result = await AchievementService.getAchievementWithUsersById(achievement.id);
      if (result.success && result.data) {
        const achievementData = result.data;
        
        // 获取附件信息
        const attachmentsResult = await AchievementService.getAchievementAttachments(achievement.id);
        if (attachmentsResult.success) {
          achievementData.attachments = attachmentsResult.data || [];
        console.log('🔍 获取到的附件数量:', achievementData.attachments.length, '个附件');
        } else {
          console.warn('获取附件信息失败:', attachmentsResult.message);
          achievementData.attachments = [];
        }
        
        setCurrentAchievement(achievementData);
        setShowPreviewModal(true);
      } else {
        alert('获取成果详情失败：' + (result.message || '未知错误'));
      }
    } catch (error) {
      console.error('获取成果详情失败:', error);
      alert('获取成果详情失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };
  
  // 关闭预览模态框
  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setCurrentAchievementId(null);
    setCurrentAchievement(null);
  };
  
  // 驳回按钮点击
  const handleRejectClick = () => {
    setShowRejectModal(true);
  };
  
  // 取消驳回
  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };
  
  // 确认驳回
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('请输入驳回原因');
      return;
    }
    
    if (!currentAchievementId) return;
    
    try {
      const result = await AchievementService.reviewAchievement({
        id: currentAchievementId,
        action: 'reject',
        reject_reason: rejectReason.trim(),
        reviewer_id: currentInstructorId
      } as any);
      
      if (result.success) {
        alert(result.message);
        setShowRejectModal(false);
        setShowPreviewModal(false);
        setRejectReason('');
        setCurrentAchievementId(null);
        setCurrentAchievement(null);
        
        // 刷新列表和待审批数量
        await loadAchievements();
        await refreshPendingCount();
      } else {
        alert('驳回失败：' + result.message);
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('驳回失败，请稍后重试');
    }
  };
  
  // 通过按钮点击
  const handleApproveClick = () => {
    setShowScoreModal(true);
  };
  
  // 取消评分
  const handleCancelScore = () => {
    setShowScoreModal(false);
    setScore('');
  };
  
  // 确认评分
  const handleConfirmScore = async () => {
    const scoreValue = parseInt(score);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      alert('请输入有效的分数（0-100）');
      return;
    }
    
    if (!currentAchievementId) return;
    
    try {
      const result = await AchievementService.reviewAchievement({
        id: currentAchievementId,
        action: 'approve',
        score: scoreValue,
        reviewer_id: currentInstructorId
      } as any);
      
      if (result.success) {
        alert(result.message);
        setShowScoreModal(false);
        setShowPreviewModal(false);
        setScore('');
        setCurrentAchievementId(null);
        setCurrentAchievement(null);
        
        // 刷新列表和待审批数量
        await loadAchievements();
        await refreshPendingCount();
      } else {
        alert('审批失败：' + result.message);
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('审批失败，请稍后重试');
    }
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
  const getStatusStyle = (status: number | AchievementStatus) => {
    // 处理数字状态
    const statusNum = typeof status === 'number' ? status : 
      status === 'pending' ? 1 : 
      status === 'approved' ? 2 : 
      status === 'rejected' ? 3 : 
      status === 'draft' ? 0 : 0;
    
    switch (statusNum) {
      case 1: // pending
        return 'px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full';
      case 2: // approved
        return 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full';
      case 3: // rejected
        return 'px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full';
      case 0: // draft
      default:
        return 'px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full';
    }
  };
  
  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const totalPages = Math.ceil(total / pageSize);
  
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
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                >
                  <i className="fas fa-tasks w-6 text-center"></i>
                  <span className="ml-3">成果审批</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingCount > 0 ? pendingCount : '0'}
                  </span>
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
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                >
                  <i className="fas fa-eye w-6 text-center"></i>
                  <span className="ml-3">成果查看</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('username');
                    window.location.href = '/login';
                  }}
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover} w-full text-left`}
                >
                  <i className="fas fa-sign-out-alt w-6 text-center"></i>
                  <span className="ml-3">退出登录</span>
                </button>
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
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果审批</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">

                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/W9aKtpJZs9s/" 
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
            {/* 搜索栏 */}
            <div className={`bg-white rounded-xl shadow-card p-6 mb-6 ${styles.fadeIn}`}>
              <h3 className="text-lg font-semibold text-text-primary mb-4">搜索条件</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 班级选择 */}
                <div className="form-group">
                  <label htmlFor="class-select" className="block text-sm font-medium text-text-secondary mb-1">班级</label>
                  <select 
                    id="class-select"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary ${styles.customSelect}`}
                  >
                    <option value="">全部班级</option>
                    <option value="class1">软件工程1班</option>
                    <option value="class2">软件工程2班</option>
                    <option value="class3">计算机科学与技术1班</option>
                    <option value="class4">计算机科学与技术2班</option>
                  </select>
                </div>
                
                {/* 类型选择 */}
                <div className="form-group">
                  <label htmlFor="type-select" className="block text-sm font-medium text-text-secondary mb-1">类型</label>
                  <select 
                    id="type-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary ${styles.customSelect}`}
                  >
                    <option value="">全部类型</option>
                    {achievementTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 成果名称 */}
                <div className="form-group">
                  <label htmlFor="name-input" className="block text-sm font-medium text-text-secondary mb-1">成果名称</label>
                  <input 
                    type="text" 
                    id="name-input"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="请输入成果名称" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>
                
                {/* 学生姓名 */}
                <div className="form-group">
                  <label htmlFor="student-input" className="block text-sm font-medium text-text-secondary mb-1">学生姓名</label>
                  <input 
                    type="text" 
                    id="student-input"
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                    placeholder="请输入学生姓名" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>
              </div>
              
              {/* 状态筛选 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="form-group">
                  <label htmlFor="status-select" className="block text-sm font-medium text-text-secondary mb-1">审批状态</label>
                  <select 
                    id="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AchievementStatus)}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary ${styles.customSelect}`}
                  >
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
                <div className="col-span-3 flex items-end">
                  <div className="flex space-x-2 w-full justify-end">
                    <button 
                      onClick={handleClearFilters}
                      className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-bg-gray transition-colors"
                    >
                      <i className="fas fa-times mr-2"></i>清除条件
                    </button>
                    <button 
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-search mr-2"></i>
                      {isLoading ? '搜索中...' : '搜索'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 搜索按钮 */}
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleSearch}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  <i className="fas fa-search mr-2"></i>搜索
                </button>
              </div>
            </div>
            
            {/* 成果列表 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">成果列表</h3>
                  {/* 快捷状态切换 */}
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => setStatusFilter('pending')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        statusFilter === 'pending' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className="fas fa-clock mr-1"></i>
                      待审核
                    </button>
                    <button
                      onClick={() => setStatusFilter('approved')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        statusFilter === 'approved' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className="fas fa-check-circle mr-1"></i>
                      已通过
                    </button>
                    <button
                      onClick={() => setStatusFilter('rejected')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        statusFilter === 'rejected' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className="fas fa-times-circle mr-1"></i>
                      已拒绝
                    </button>
                    <button
                      onClick={() => setStatusFilter('draft')}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        statusFilter === 'draft' 
                          ? 'bg-gray-100 text-gray-800 border border-gray-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className="fas fa-file-alt mr-1"></i>
                      草稿
                    </button>
                  </div>
                </div>
                <div className="text-sm text-text-muted">
                  {isLoading ? '加载中...' : `共 ${total} 条记录`}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">成果名称</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">学生姓名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">指导老师</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">状态</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">分数</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">提交时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-text-muted">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          加载中...
                        </td>
                      </tr>
                    ) : achievements.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-text-muted">
                          <i className="fas fa-inbox text-4xl mb-2"></i>
                          <p>暂无{statusFilter === 'pending' ? '待审批' : '相关'}成果</p>
                        </td>
                      </tr>
                    ) : (
                      achievements.map((achievement, index) => (
                        <tr key={achievement.id} className={`${index < achievements.length - 1 ? 'border-b border-border-light' : ''} hover:bg-bg-gray`}>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            <div className="max-w-xs truncate" title={achievement.title}>
                              {achievement.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            <span className={getTypeStyle((achievement as any).type?.name || '其他')}>
                              {(achievement as any).type?.name || '其他'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center mr-2">
                                <i className="fas fa-user text-white text-xs"></i>
                              </div>
                              <div>
                                <div>{achievement.publisher?.full_name || achievement.publisher?.username}</div>
                                <div className="text-xs text-text-muted">{achievement.publisher?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            {achievement.instructor?.full_name || achievement.instructor?.username || '未指定'}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            <span className={getStatusStyle(achievement.status)}>
                              {achievement.status === 1 ? '待审核' : 
                               achievement.status === 2 ? '已通过' : 
                               achievement.status === 3 ? '已拒绝' : achievement.status === 0 ? '草稿' : '未知状态'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">
                            {achievement.score !== null && achievement.score !== undefined ? (
                              <span className={`font-medium ${
                                achievement.score >= 90 ? 'text-green-600' :
                                achievement.score >= 80 ? 'text-blue-600' :
                                achievement.score >= 70 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {achievement.score}分
                              </span>
                            ) : (
                              <span className="text-text-muted">未评分</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-muted">
                            {new Date(achievement.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleReviewClick(achievement)}
                              className="px-3 py-1 bg-secondary text-white text-sm rounded-lg hover:bg-accent transition-colors mr-2"
                            >
                              批改
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              {!isLoading && achievements.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-text-muted">
                    显示 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} 条，共 {total} 条
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === pageNum 
                              ? 'bg-secondary text-white' 
                              : 'border border-border-light text-text-secondary hover:bg-bg-gray'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* 成果预览模态框 */}
      {showPreviewModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => handleModalBackdropClick(e, handleClosePreviewModal)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 模态框头部 */}
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <h3 className="text-xl font-semibold text-text-primary">
                {currentAchievement ? `成果预览: ${currentAchievement.title}` : '成果预览'}
              </h3>
              <button 
                onClick={handleClosePreviewModal}
                className="text-text-muted hover:text-text-primary"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            {/* 模态框内容 */}
            <div className="p-6 overflow-y-auto flex-grow">
              {currentAchievement ? (
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
                        <span className={getTypeStyle((currentAchievement as any).type?.name || '其他')}>
                          {(currentAchievement as any).type?.name || '其他'}
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
                        <span className={getStatusStyle(currentAchievement.status)}>
                          {currentAchievement.status === 1 ? '待审核' : 
                           currentAchievement.status === 2 ? '已通过' : 
                           currentAchievement.status === 3 ? '已拒绝' : currentAchievement.status === 0 ? '草稿' : '未知状态'}
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
                            {currentAchievement.parent.username}
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
                  
                  {/* 需求文档 */}
                  {currentAchievement.attachments && currentAchievement.attachments.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-text-primary mb-4">需求文档</h4>
                      <div className="bg-bg-gray p-4 rounded-lg">
                        <div className="space-y-3">
                          {currentAchievement.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border-light">
                              <div className="flex items-center flex-1 min-w-0">
                                <i className="fas fa-file-pdf text-red-500 text-xl mr-3"></i>
                                <div>
                                  <p className="text-sm font-medium text-text-primary truncate max-w-[300px]">
                                    {attachment.file_name}
                                  </p>
                                  <p className="text-xs text-text-muted">
                                    文件大小: {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                            <a
                              href={attachment.file_url}
                              target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                              >
                                <i className="fas fa-eye mr-2"></i>
                                查看
                              </a>
                            </div>
                          ))}
                        </div>
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
              ) : (
                <div className="text-center py-10 text-text-muted">
                  <i className="fas fa-file-alt text-4xl mb-4"></i>
                  <p>请选择一个成果进行预览</p>
                </div>
              )}
            </div>
            
            {/* 模态框底部 */}
            <div className="p-6 border-t border-border-light flex justify-end space-x-4">
              <button 
                onClick={handleRejectClick}
                className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                驳回
              </button>
              <button 
                onClick={handleApproveClick}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 驳回原因模态框 */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => handleModalBackdropClick(e, handleCancelReject)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">驳回原因</h3>
            <textarea 
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入驳回原因..." 
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleCancelReject}
                className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-bg-gray transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmReject}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 评分模态框 */}
      {showScoreModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => handleModalBackdropClick(e, handleCancelScore)}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-text-primary mb-4">评分</h3>
            <div className="mb-4">
              <label htmlFor="score-input" className="block text-sm font-medium text-text-secondary mb-1">分数</label>
              <input 
                type="number" 
                id="score-input"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min="0" 
                max="100" 
                step="1" 
                placeholder="请输入分数" 
                className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleCancelScore}
                className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-bg-gray transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmScore}
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
              >
                确认通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementApprovalPage;

