

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  const [projectSearchTerm, setProjectSearchTerm] = useState<string>('');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('');
  const [activePage, setActivePage] = useState<number>(1);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 首页';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    // 设置当前日期
    const date = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    // 初始化饼图
    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      const Chart = (window as any).Chart;
      if (Chart) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['课程项目', '科研项目'],
            datasets: [{
              data: [95, 33],
              backgroundColor: ['#FF8C00', '#624731'],
              borderWidth: 0,
              cutout: '60%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  font: {
                    size: 14
                  }
                }
              }
            }
          }
        });
      }
    }
  }, []);

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/project-intro?search=${encodeURIComponent(globalSearchTerm)}`);
    }
  };

  const handleProjectSearch = () => {
    navigate(`/project-intro?search=${encodeURIComponent(projectSearchTerm)}&type=${encodeURIComponent(projectTypeFilter)}`);
  };

  const handleProjectCardClick = (projectId: string) => {
    navigate(`/project-detail?projectId=${projectId}`);
  };

  const handlePageClick = (pageNum: number) => {
    setActivePage(pageNum);
  };

  const handleUserAvatarClick = () => {
    navigate('/personal-center');
  };

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/login');
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
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                onKeyPress={handleGlobalSearchKeyPress}
                className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg bg-white ${styles.searchInputFocus}`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
            </div>
          </div>
          
          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
              onClick={handleUserAvatarClick}
            >
              <img 
                src="https://s.coze.cn/image/kAdJP1T8_5w/" 
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
              <Link to="/home" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
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
              <a 
                href="#" 
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-red-500"
              >
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">欢迎回来，{user?.username || '用户'}</h2>
              <p className="text-text-secondary">这里是软院项目通，您可以查看学院项目和最新动态</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">今天是</p>
              <p className="text-lg font-semibold text-text-primary">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* 学院简介模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center">
            <i className="fas fa-university text-orange-500 mr-3"></i>
            学院简介
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <img 
                src="https://s.coze.cn/image/qIIIws7FP6o/" 
                alt="河北师范大学软件学院教学楼" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-lg font-semibold text-text-primary mb-3">学院概况</h4>
              <p className="text-text-secondary leading-relaxed mb-4">
                河北师范大学软件学院成立于2002年，是河北省首批示范性软件学院。学院以培养应用型、复合型、创新型软件人才为目标，
                拥有一支结构合理、教学经验丰富的师资队伍，现有教授15人，副教授28人，博士学位教师占比75%。
              </p>
              <h4 className="text-lg font-semibold text-text-primary mb-3">师资力量</h4>
              <p className="text-text-secondary leading-relaxed">
                学院教师队伍结构合理，既有在教学一线经验丰富的资深教师，也有在科研领域成果丰硕的青年学者。
                近年来，学院教师主持国家级、省部级科研项目30余项，发表高水平学术论文200余篇。
              </p>
            </div>
          </div>
        </section>

        {/* 数据统计模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6 mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
            <i className="fas fa-chart-pie text-orange-500 mr-3"></i>
            项目数据统计
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 统计卡片 */}
            <div className="lg:col-span-1 space-y-4">
              <div className={`${styles.statCard} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">项目总数</p>
                    <p className="text-3xl font-bold text-text-primary">128</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-folder text-orange-500 text-xl"></i>
                  </div>
                </div>
              </div>
              <div className={`${styles.statCard} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">课程项目</p>
                    <p className="text-3xl font-bold text-text-primary">95</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-graduation-cap text-orange-400 text-xl"></i>
                  </div>
                </div>
              </div>
              <div className={`${styles.statCard} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">科研项目</p>
                    <p className="text-3xl font-bold text-text-primary">33</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-flask text-orange-500 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 饼图 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 border border-border-light">
                <h4 className="text-lg font-semibold text-text-primary mb-4">项目类型分布</h4>
                <div className="h-64">
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 项目概览模块 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center">
            <i className="fas fa-star text-orange-500 mr-3"></i>
              项目概览
            </h3>
            <Link to="/project-intro" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
              查看全部
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
          
          {/* 项目搜索工具栏 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索项目名称、负责人..." 
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                </div>
              </div>
              <div className="w-full md:w-48">
                <select 
                  value={projectTypeFilter}
                  onChange={(e) => setProjectTypeFilter(e.target.value)}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.searchInputFocus}`}
                >
                  <option value="">全部类型</option>
                  <option value="course">课程项目</option>
                  <option value="research">科研项目</option>
                </select>
              </div>
              <button 
                onClick={handleProjectSearch}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <i className="fas fa-search mr-2"></i>
                搜索
              </button>
            </div>
          </div>
          
          {/* 项目列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 项目卡片1 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project1')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/7aIj5sZqmP0/" 
                  alt="在线教育平台项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  课程项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">在线教育平台设计与实现</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>李教授</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2024-01-10</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片2 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project2')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/P0HadGiRFls/" 
                  alt="智能推荐系统项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  科研项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">基于深度学习的智能推荐系统研究</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>王博士</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2024-01-08</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片3 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project3')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/qIO3bqw4Pb8/" 
                  alt="移动应用开发项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  课程项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">校园生活服务APP开发</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>张老师</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2024-01-05</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片4 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project4')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/PFVCy4U5nqU/" 
                  alt="数据分析平台项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  科研项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">大数据分析平台架构设计</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>刘教授</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2024-01-03</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片5 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project5')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/8HCwLiJeNVA/" 
                  alt="区块链应用项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  课程项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">区块链技术在供应链管理中的应用</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>陈老师</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2024-01-01</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片6 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project6')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/N_SMD3bZdZ4/" 
                  alt="人工智能项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  科研项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">基于强化学习的自主决策系统</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>赵博士</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2023-12-28</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片7 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project7')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/HN9oz_GKCBc/" 
                  alt="云计算项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  课程项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">云原生应用开发与部署实践</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>孙老师</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2023-12-25</span>
                </div>
              </div>
            </div>
            
            {/* 项目卡片8 */}
            <div 
              className={`bg-white rounded-xl border border-border-light overflow-hidden cursor-pointer ${styles.projectCardHover}`}
              onClick={() => handleProjectCardClick('project8')}
            >
              <div className="relative">
                <img 
                  src="https://s.coze.cn/image/rCt-DyEoBFY/" 
                  alt="网络安全项目截图" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                  科研项目
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-2 line-clamp-2">网络安全威胁检测与防御技术研究</h4>
                <div className="flex items-center text-sm text-text-muted mb-2">
                  <i className="fas fa-user mr-1"></i>
                  <span>周教授</span>
                </div>
                <div className="flex items-center text-sm text-text-muted">
                  <i className="fas fa-calendar mr-1"></i>
                  <span>2023-12-20</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 分页 */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <button className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button 
              onClick={() => handlePageClick(1)}
              className={`px-3 py-2 rounded-lg ${activePage === 1 ? 'bg-orange-500 text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
            >
              1
            </button>
            <button 
              onClick={() => handlePageClick(2)}
              className={`px-3 py-2 rounded-lg ${activePage === 2 ? 'bg-orange-500 text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
            >
              2
            </button>
            <button 
              onClick={() => handlePageClick(3)}
              className={`px-3 py-2 rounded-lg ${activePage === 3 ? 'bg-orange-500 text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
            >
              3
            </button>
            <span className="px-3 py-2 text-text-muted">...</span>
            <button 
              onClick={() => handlePageClick(13)}
              className={`px-3 py-2 rounded-lg ${activePage === 13 ? 'bg-orange-500 text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'}`}
            >
              13
            </button>
            <button className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

