

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submitTime: string;
  imageUrl: string;
  category: string;
}

interface ConfirmModalData {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const PersonalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 状态管理
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [projectSearchValue, setProjectSearchValue] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('');
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<ConfirmModalData>({
    isVisible: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 项目数据
  const [projects] = useState<Project[]>([
    {
      id: 'my-project1',
      title: '在线教育平台设计与实现',
      description: '基于Web的在线教育平台，支持课程管理、视频播放、作业提交等功能',
      status: 'pending',
      submitTime: '2024-01-10',
      imageUrl: 'https://s.coze.cn/image/YPu2uTsWyjI/',
      category: '商业科技'
    },
    {
      id: 'my-project2',
      title: '基于深度学习的智能推荐系统研究',
      description: '利用深度学习技术实现个性化内容推荐，提高用户体验和内容匹配度',
      status: 'rejected',
      submitTime: '2024-01-08',
      imageUrl: 'https://s.coze.cn/image/Sm82_Z4Nx3A/',
      category: '商业科技'
    },
    {
      id: 'my-project3',
      title: '校园生活服务APP开发',
      description: '为学生提供校园生活服务的移动应用，包括课程表、成绩查询、校园活动等功能',
      status: 'approved',
      submitTime: '2024-01-05',
      imageUrl: 'https://s.coze.cn/image/r-US1c9D0VY/',
      category: '商业科技'
    },
    {
      id: 'my-project4',
      title: '大数据分析平台架构设计',
      description: '基于Hadoop生态系统的大数据分析平台，支持数据采集、存储、处理和可视化',
      status: 'draft',
      submitTime: '2024-01-03',
      imageUrl: 'https://s.coze.cn/image/uQr4IeZlXNM/',
      category: '商业科技'
    }
  ]);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 我的项目';
    return () => { document.title = originalTitle; };
  }, []);

  // 全局搜索处理
  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/project-intro?search=${encodeURIComponent(globalSearchValue)}`);
    }
  };

  // 项目搜索处理
  const handleProjectSearch = () => {
    console.log('搜索项目:', projectSearchValue, '状态筛选:', projectStatusFilter);
    // 实际应用中这里应该发起搜索请求
  };

  // 查看未通过原因
  const handleViewReason = () => {
    setIsReasonModalVisible(true);
  };

  // 关闭原因模态框
  const handleCloseReasonModal = () => {
    setIsReasonModalVisible(false);
  };

  // 编辑项目
  const handleEditProject = (projectId: string) => {
    console.log('编辑项目:', projectId);
    alert(`项目 ${projectId} 已提交编辑申请，等待审批`);
  };

  // 删除项目
  const handleDeleteProject = (projectId: string) => {
    setConfirmModalData({
      isVisible: true,
      title: '确认删除',
      message: '您确定要删除此项目吗？删除后将无法恢复。',
      onConfirm: () => {
        console.log('删除项目:', projectId);
        setConfirmModalData(prev => ({ ...prev, isVisible: false }));
        alert(`项目 ${projectId} 已提交删除申请，等待审批`);
      }
    });
  };

  // 撤回项目
  const handleWithdrawProject = () => {
    setConfirmModalData({
      isVisible: true,
      title: '确认撤回',
      message: '您确定要撤回此项目的审核申请吗？',
      onConfirm: () => {
        setConfirmModalData(prev => ({ ...prev, isVisible: false }));
        alert('项目已撤回');
      }
    });
  };

  // 提交审核
  const handleSubmitProject = () => {
    setConfirmModalData({
      isVisible: true,
      title: '提交审核',
      message: '您确定要提交此项目进行审核吗？提交后将进入审核流程。',
      onConfirm: () => {
        setConfirmModalData(prev => ({ ...prev, isVisible: false }));
        alert('项目已提交审核');
      }
    });
  };

  // 查看详情
  const handleViewDetails = (projectId: string) => {
    navigate(`/project-detail?projectId=${projectId}`);
  };

  // 关闭确认模态框
  const handleCloseConfirmModal = () => {
    setConfirmModalData(prev => ({ ...prev, isVisible: false }));
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 获取状态标签样式和文本
  const getStatusInfo = (status: Project['status']) => {
    switch (status) {
      case 'pending':
        return { class: 'bg-status-pending', text: '审核中' };
      case 'rejected':
        return { class: 'bg-status-rejected', text: '未通过' };
      case 'approved':
        return { class: 'bg-status-approved', text: '已通过' };
      case 'draft':
        return { class: 'bg-status-draft', text: '草稿' };
      default:
        return { class: 'bg-gray-500', text: '未知' };
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
              <div className="w-10 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center">
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
                value={globalSearchValue}
                onChange={(e) => setGlobalSearchValue(e.target.value)}
                onKeyPress={handleGlobalSearchKeyPress}
                placeholder="搜索项目..." 
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-4">
            <Link to="/personal-center" className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
              <img 
                src="https://s.coze.cn/image/GD5qW7NQD48/" 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">{user?.username || '用户'}</span>
              <i className="fas fa-chevron-down text-xs text-text-muted"></i>
            </Link>
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
              <Link to="/business-process" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
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
              <Link to="/media-consult" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-newspaper text-lg"></i>
                <span className="font-medium">媒体咨询</span>
              </Link>
            </li>
            <li>
              <Link to="/my-project" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
                <i className="fas fa-tasks text-lg"></i>
                <span className="font-medium">我的项目</span>
              </Link>
            </li>
            <li>
              <Link to="/login" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500">
                <i className="fas fa-sign-out-alt text-lg"></i>
                <span className="font-medium">退出登录</span>
              </Link>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">我的项目</h2>
              <p className="text-text-secondary">管理您创建和参与的项目</p>
            </div>
            <button 
              onClick={() => alert('创建新项目功能将在后续版本中实现')}
              className={`px-6 py-2 ${styles.bgSecondary} text-white rounded-lg hover:${styles.bgAccent} transition-colors flex items-center`}
            >
              <i className="fas fa-plus mr-2"></i>
              创建项目
            </button>
          </div>
        </div>

        {/* 项目搜索工具栏 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input 
                  type="text" 
                  value={projectSearchValue}
                  onChange={(e) => setProjectSearchValue(e.target.value)}
                  placeholder="搜索项目名称、关键词..." 
                  className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
              </div>
            </div>
            <div className="w-full md:w-48">
              <select 
                value={projectStatusFilter}
                onChange={(e) => setProjectStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="pending">审核中</option>
                <option value="approved">已通过</option>
                <option value="rejected">未通过</option>
              </select>
            </div>
            <button 
              onClick={handleProjectSearch}
              className={`px-6 py-2 ${styles.bgSecondary} text-white rounded-lg hover:${styles.bgAccent} transition-colors`}
            >
              <i className="fas fa-search mr-2"></i>
              搜索
            </button>
          </div>
        </div>
        
        {/* 项目列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const statusInfo = getStatusInfo(project.status);
            
            return (
              <div key={project.id} className={`bg-white rounded-xl border border-border-light overflow-hidden ${styles.projectCardHover}`}>
                <div className="relative">
                  <img 
                    src={project.imageUrl}
                    alt={`${project.title}项目截图`}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-3 right-3 ${styles.statusBadge} ${statusInfo.class} text-white`}>
                    {statusInfo.text}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-semibold text-text-primary mb-2 text-lg">{project.title}</h4>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center text-sm text-text-muted mb-4">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    <span>{project.status === 'draft' ? '创建时间' : '提交时间'}: {project.submitTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProject(project.id)}
                        className={`${styles.actionButton} px-4 py-2 ${styles.bgPrimary} text-${styles.bgSecondary} rounded-lg hover:bg-opacity-80 flex items-center`}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        编辑
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className={`${styles.actionButton} px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center`}
                      >
                        <i className="fas fa-trash-alt mr-1"></i>
                        删除
                      </button>
                    </div>
                    {project.status === 'pending' && (
                      <button 
                        onClick={handleWithdrawProject}
                        className={`${styles.actionButton} px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center`}
                      >
                        <i className="fas fa-undo mr-1"></i>
                        撤回
                      </button>
                    )}
                    {project.status === 'rejected' && (
                      <button 
                        onClick={handleViewReason}
                        className={`${styles.actionButton} px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 flex items-center`}
                      >
                        <i className="fas fa-eye mr-1"></i>
                        查看原因
                      </button>
                    )}
                    {project.status === 'approved' && (
                      <button 
                        onClick={() => handleViewDetails(project.id)}
                        className={`${styles.actionButton} px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center`}
                      >
                        <i className="fas fa-info-circle mr-1"></i>
                        查看详情
                      </button>
                    )}
                    {project.status === 'draft' && (
                      <button 
                        onClick={handleSubmitProject}
                        className={`${styles.actionButton} px-4 py-2 ${styles.bgSecondary} text-white rounded-lg hover:${styles.bgAccent} flex items-center`}
                      >
                        <i className="fas fa-paper-plane mr-1"></i>
                        提交审核
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 分页 */}
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50 disabled:opacity-50"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            onClick={() => handlePageChange(1)}
            className={`px-3 py-2 rounded-lg ${currentPage === 1 ? `${styles.bgSecondary} text-white` : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
          >
            1
          </button>
          <button 
            onClick={() => handlePageChange(2)}
            className={`px-3 py-2 rounded-lg ${currentPage === 2 ? `${styles.bgSecondary} text-white` : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
          >
            2
          </button>
          <span className="px-3 py-2 text-text-muted">...</span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </main>

      {/* 模态框 - 审批原因 */}
      {isReasonModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-primary">未通过原因</h3>
              <button 
                onClick={handleCloseReasonModal}
                className="text-text-muted hover:text-text-primary"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-text-secondary mb-2">项目名称：基于深度学习的智能推荐系统研究</p>
              <p className="text-text-secondary mb-4">提交时间：2024-01-08</p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">
                  {'1. 项目技术方案不够详细，缺乏具体的实现路径和关键技术点说明'}<br />
                  {'2. 预期成果和创新点描述不够清晰，需要进一步明确'}<br />
                  {'3. 项目进度安排不够合理，建议调整时间节点'}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleCloseReasonModal}
                className={`px-6 py-2 ${styles.bgSecondary} text-white rounded-lg hover:${styles.bgAccent}`}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模态框 - 操作确认 */}
      {confirmModalData.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-primary">{confirmModalData.title}</h3>
              <button 
                onClick={handleCloseConfirmModal}
                className="text-text-muted hover:text-text-primary"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <p className="text-text-secondary mb-6">
              {confirmModalData.message}
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleCloseConfirmModal}
                className="px-6 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={confirmModalData.onConfirm}
                className={`px-6 py-2 ${styles.bgSecondary} text-white rounded-lg hover:${styles.bgAccent}`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjectPage;

