

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface ProjectData {
  title: string;
  submitTime: string;
  updateTime: string;
  type: string;
  leader: string;
  status: string;
  image: string;
  background: string;
  description: string;
}

interface ProjectMember {
  name: string;
  role: string;
  avatar: string;
  position: string;
}

const ProjectDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '在线教育平台设计与实现',
    submitTime: '2024-01-10',
    updateTime: '2024-01-15',
    type: '课程项目',
    leader: '李教授',
    status: '进行中',
    image: 'https://s.coze.cn/image/-DQmsWgof7c/',
    background: '随着信息技术的快速发展，在线教育已成为教育领域的重要组成部分。特别是在新冠疫情期间，在线教育平台的需求急剧增加。然而，现有的在线教育平台普遍存在功能单一、用户体验不佳、个性化学习不足等问题。本项目旨在设计和实现一个功能完善、用户友好的在线教育平台，为学生提供更加优质的学习体验，为教师提供更加便捷的教学管理工具。',
    description: '本项目是一个基于Web的在线教育平台，主要功能包括：用户管理模块、课程管理模块、学习系统、互动功能、数据分析等模块。'
  });

  const [projectMembers] = useState<ProjectMember[]>([
    {
      name: '李教授',
      role: '项目负责人',
      avatar: 'https://s.coze.cn/image/fvRngURU8Xg/',
      position: '负责人'
    },
    {
      name: user?.username || '用户',
      role: '前端开发',
      avatar: 'https://s.coze.cn/image/nMNl7GeJMbA/',
      position: '成员'
    },
    {
      name: '王同学',
      role: '后端开发',
      avatar: 'https://s.coze.cn/image/olkqQid5B8U/',
      position: '成员'
    },
    {
      name: '刘同学',
      role: 'UI设计师',
      avatar: 'https://s.coze.cn/image/KpLhg6XC6UE/',
      position: '成员'
    },
    {
      name: '陈同学',
      role: '测试工程师',
      avatar: 'https://s.coze.cn/image/x_s2A4qJuyo/',
      position: '成员'
    }
  ]);

  const [globalSearchValue, setGlobalSearchValue] = useState('');

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 项目详情';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      loadProjectDetails(projectId);
    }
  }, [searchParams]);

  const loadProjectDetails = (projectId: string) => {
    const mockProjects: Record<string, ProjectData> = {
      'project1': {
        title: '在线教育平台设计与实现',
        submitTime: '2024-01-10',
        updateTime: '2024-01-15',
        type: '课程项目',
        leader: '李教授',
        status: '进行中',
        image: 'https://s.coze.cn/image/ZtI9fynU6pU/',
        background: '随着信息技术的快速发展，在线教育已成为教育领域的重要组成部分...',
        description: '本项目是一个基于Web的在线教育平台，主要功能包括：用户管理、课程管理、学习系统、互动功能、数据分析等模块。'
      },
      'project2': {
        title: '基于深度学习的智能推荐系统研究',
        submitTime: '2024-01-08',
        updateTime: '2024-01-14',
        type: '科研项目',
        leader: '王博士',
        status: '已完成',
        image: 'https://s.coze.cn/image/qYvHtqtbA4E/',
        background: '推荐系统在现代信息社会中扮演着越来越重要的角色...',
        description: '本项目研究基于深度学习的智能推荐算法，旨在提高推荐系统的准确性和用户体验。'
      }
    };

    const project = mockProjects[projectId];
    if (project) {
      setProjectData(project);
    }
  };

  const handleImageClick = () => {
    setIsImageViewerOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleImageOverlayClick = () => {
    handleImageClick();
  };

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/project-intro?search=${encodeURIComponent(globalSearchValue)}`);
    }
  };

  const handleUserSectionClick = () => {
    navigate('/personal-center');
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageViewerOpen) {
        handleCloseImageViewer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageViewerOpen]);

  const getProjectTypeClass = (type: string) => {
    if (type === '科研项目') {
      return 'px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full';
    }
    return 'px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full';
  };

  const getProjectStatusClass = (status: string) => {
    if (status === '已完成') {
      return 'px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full';
    }
    return 'px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full';
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
          <div className="flex items-center space-x-4" onClick={handleUserSectionClick}>
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
              <img 
                src="https://s.coze.cn/image/oI9JlAsSrRk/" 
                alt="用户头像" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-text-primary">张同学</span>
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
              <Link to="/project-intro" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
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
              <a href="#" onClick={handleLogoutClick} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500">
                <i className="fas fa-sign-out-alt text-lg"></i>
                <span className="font-medium">退出登录</span>
              </a>
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
              {/* 面包屑导航 */}
              <nav className="text-sm text-text-muted mb-2">
                <Link to="/home" className="hover:text-orange-500">首页</Link>
                <span className="mx-2">/</span>
                <Link to="/project-intro" className="hover:text-orange-500">成果发布</Link>
                <span className="mx-2">/</span>
                <span className="text-text-primary">项目详情</span>
              </nav>
              <h2 className="text-2xl font-bold text-text-primary">{projectData.title}</h2>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-text-muted mb-1">
                <i className="fas fa-calendar mr-2"></i>
                <span>{projectData.submitTime}</span>
              </div>
              <div className="flex items-center text-sm text-text-muted">
                <i className="fas fa-clock mr-2"></i>
                <span>最后更新：{projectData.updateTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 项目详情内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 项目图片 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-image text-orange-500 mr-2"></i>
                项目截图
              </h3>
              <div className="relative">
                <img 
                  src={projectData.image}
                  alt={`${projectData.title}项目截图`}
                  className={`w-full h-96 object-cover rounded-xl ${styles.projectImage}`}
                  onClick={handleImageClick}
                />
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleImageOverlayClick}
                >
                  <i className="fas fa-search-plus text-white text-3xl"></i>
                </div>
              </div>
              <p className="text-sm text-text-muted mt-2 text-center">点击图片查看大图</p>
            </section>

            {/* 项目背景 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-lightbulb text-orange-500 mr-2"></i>
                项目背景
              </h3>
              <div className={`text-text-secondary ${styles.markdownContent}`}>
                <p>随着信息技术的快速发展，在线教育已成为教育领域的重要组成部分。特别是在新冠疫情期间，在线教育平台的需求急剧增加。然而，现有的在线教育平台普遍存在功能单一、用户体验不佳、个性化学习不足等问题。</p>
                <p>本项目旨在设计和实现一个功能完善、用户友好的在线教育平台，为学生提供更加优质的学习体验，为教师提供更加便捷的教学管理工具。</p>
              </div>
            </section>

            {/* 项目描述 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-file-alt text-orange-500 mr-2"></i>
                项目描述
              </h3>
              <div className={`text-text-secondary ${styles.markdownContent}`}>
                <p>本项目是一个基于Web的在线教育平台，主要功能包括：</p>
                <ul className="list-disc">
                  <li><strong>用户管理模块</strong>：支持学生、教师、管理员三种角色的注册、登录和权限管理</li>
                  <li><strong>课程管理模块</strong>：课程创建、编辑、发布、归档等功能</li>
                  <li><strong>学习系统</strong>：视频播放、在线作业、考试测评、学习进度跟踪</li>
                  <li><strong>互动功能</strong>：讨论区、在线答疑、实时通知</li>
                  <li><strong>数据分析</strong>：学习行为分析、成绩统计、教学效果评估</li>
                </ul>
                <h3>技术架构</h3>
                <p>本项目采用现代化的技术栈进行开发：</p>
                <ul className="list-disc">
                  <li><strong>前端</strong>：React + TypeScript + Ant Design</li>
                  <li><strong>后端</strong>：Node.js + Express + MongoDB</li>
                  <li><strong>数据库</strong>：MongoDB + Redis</li>
                  <li><strong>部署</strong>：Docker + Kubernetes</li>
                </ul>
                <h3>创新点</h3>
                <p>本项目的主要创新点在于：</p>
                <ul className="list-disc">
                  <li>基于AI的个性化学习推荐系统</li>
                  <li>实时协作学习功能</li>
                  <li>多终端同步学习体验</li>
                  <li>区块链技术的学习证书认证</li>
                </ul>
              </div>
            </section>
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-6">
            {/* 项目基本信息 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-info-circle text-orange-500 mr-2"></i>
                项目信息
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">项目类型</span>
                  <span className={getProjectTypeClass(projectData.type)}>{projectData.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">负责人</span>
                  <span className="text-text-primary font-medium">{projectData.leader}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">提交时间</span>
                  <span className="text-text-primary">{projectData.submitTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">项目状态</span>
                  <span className={getProjectStatusClass(projectData.status)}>{projectData.status}</span>
                </div>
              </div>
            </section>

            {/* 项目成员 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-users text-orange-500 mr-2"></i>
                项目成员
              </h3>
              <div className="space-y-3">
                {projectMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={member.avatar}
                      alt={`${member.name}头像`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{member.name}</p>
                      <p className="text-sm text-text-muted">{member.role}</p>
                    </div>
                    <span className={`${styles.memberTag} px-2 py-1 text-xs rounded-full`}>{member.position}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 项目进度 */}
            <section className="bg-bg-light rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <i className="fas fa-tasks text-orange-500 mr-2"></i>
                项目进度
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-primary">需求分析</span>
                    <span className="text-sm text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-primary">系统设计</span>
                    <span className="text-sm text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-primary">开发实现</span>
                    <span className="text-sm text-orange-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-primary">测试优化</span>
                    <span className="text-sm text-text-muted">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 图片查看器模态弹窗 */}
      {isImageViewerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseImageViewer();
            }
          }}
        >
          <div className="relative max-w-full max-h-full p-4">
            <button 
              onClick={handleCloseImageViewer}
              className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors z-10"
            >
              <i className="fas fa-times"></i>
            </button>
            <img 
              src={projectData.image}
              alt="项目大图"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;

