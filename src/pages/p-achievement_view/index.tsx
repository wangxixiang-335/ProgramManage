

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface Achievement {
  id: string;
  name: string;
  score: number;
  type: string;
  studentName: string;
  studentAvatar: string;
  teacherName: string;
  submitTime: string;
}

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

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 成果查看';
    return () => { document.title = originalTitle; };
  }, []);

  // 模拟成果数据
  const achievements: Achievement[] = [
    {
      id: '1',
      name: '基于深度学习的图像识别系统',
      score: 92,
      type: '软件作品',
      studentName: '李明',
      studentAvatar: 'https://s.coze.cn/image/LRqi5MlK7V8/',
      teacherName: '张教授',
      submitTime: '2024-06-15'
    },
    {
      id: '2',
      name: '移动应用开发实践报告',
      score: 88,
      type: '项目报告',
      studentName: '王华',
      studentAvatar: 'https://s.coze.cn/image/sbgYSogfF6U/',
      teacherName: '张教授',
      submitTime: '2024-06-14'
    },
    {
      id: '3',
      name: '数据库设计方案',
      score: 85,
      type: '项目报告',
      studentName: '张伟',
      studentAvatar: 'https://s.coze.cn/image/4mnm30Jb_KM/',
      teacherName: '李教授',
      submitTime: '2024-06-13'
    },
    {
      id: '4',
      name: 'Web前端开发技术总结',
      score: 90,
      type: '实验报告',
      studentName: '刘洋',
      studentAvatar: 'https://s.coze.cn/image/s3PU28tOij0/',
      teacherName: '张教授',
      submitTime: '2024-06-12'
    },
    {
      id: '5',
      name: '人工智能在教育中的应用研究',
      score: 95,
      type: '论文',
      studentName: '陈明',
      studentAvatar: 'https://s.coze.cn/image/hg75YWlWBt0/',
      teacherName: '王教授',
      submitTime: '2024-06-10'
    }
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavItemClick = (itemId: string, pageTitle: string) => {
    setActiveNavItem(itemId);
  };

  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };

  const handleSearchInputChange = (field: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchSubmit = () => {
    console.log('搜索条件:', searchFilters);
    alert('搜索功能开发中...');
  };

  const handleViewDetail = (achievementId: string) => {
    alert(`查看成果ID: ${achievementId} 的详情`);
  };

  const handlePrevPage = () => {
    alert('上一页功能开发中...');
  };

  const handleNextPage = () => {
    alert('下一页功能开发中...');
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
                  onClick={() => handleNavItemClick('dashboard-link', '数据看板')}
                >
                  <i className="fas fa-chart-line w-6 text-center"></i>
                  <span className="ml-3">数据看板</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-approval" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                  onClick={() => handleNavItemClick('approval-link', '成果审批')}
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
                  onClick={() => handleNavItemClick('publish-link', '成果发布')}
                >
                  <i className="fas fa-paper-plane w-6 text-center"></i>
                  <span className="ml-3">成果发布</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-management" 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover}`}
                  onClick={() => handleNavItemClick('management-link', '成果管理')}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3">成果管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-view" 
                  className={`flex items-center px-6 py-3 text-secondary ${styles.sidebarItemActive}`}
                  onClick={() => handleNavItemClick('view-link', '成果查看')}
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
                <button 
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover} w-full text-left`}
                >
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
                className="md:hidden text-text-primary"
                onClick={handleMobileMenuToggle}
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              
              {/* 页面标题 */}
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">成果查看</h2>
              
              {/* 用户信息 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button 
                    className="text-text-secondary hover:text-secondary"
                    onClick={handleNotificationClick}
                  >
                    <i className="fas fa-bell text-xl"></i>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://s.coze.cn/image/RFV44m1ql7s/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">张教授</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 班级选择 */}
                <div className="space-y-2">
                  <label htmlFor="class-select" className="block text-sm font-medium text-text-secondary">班级</label>
                  <select 
                    id="class-select" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    value={searchFilters.class}
                    onChange={(e) => handleSearchInputChange('class', e.target.value)}
                  >
                    <option value="">全部班级</option>
                    <option value="2021-1">2021级1班</option>
                    <option value="2021-2">2021级2班</option>
                    <option value="2022-1">2022级1班</option>
                    <option value="2022-2">2022级2班</option>
                    <option value="2023-1">2023级1班</option>
                  </select>
                </div>
                
                {/* 类型选择 */}
                <div className="space-y-2">
                  <label htmlFor="type-select" className="block text-sm font-medium text-text-secondary">类型</label>
                  <select 
                    id="type-select" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    value={searchFilters.type}
                    onChange={(e) => handleSearchInputChange('type', e.target.value)}
                  >
                    <option value="">全部类型</option>
                    <option value="project">项目报告</option>
                    <option value="paper">论文</option>
                    <option value="software">软件作品</option>
                    <option value="experiment">实验报告</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                {/* 分数选择 */}
                <div className="space-y-2">
                  <label htmlFor="score-select" className="block text-sm font-medium text-text-secondary">分数</label>
                  <select 
                    id="score-select" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    value={searchFilters.score}
                    onChange={(e) => handleSearchInputChange('score', e.target.value)}
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
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    value={searchFilters.name}
                    onChange={(e) => handleSearchInputChange('name', e.target.value)}
                  />
                </div>
                
                {/* 姓名搜索 */}
                <div className="space-y-2">
                  <label htmlFor="student-input" className="block text-sm font-medium text-text-secondary">学生姓名</label>
                  <input 
                    type="text" 
                    id="student-input" 
                    placeholder="输入学生姓名" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    value={searchFilters.student}
                    onChange={(e) => handleSearchInputChange('student', e.target.value)}
                  />
                </div>
              </div>
              
              {/* 搜索按钮 */}
              <div className="flex justify-end mt-4">
                <button 
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                  onClick={handleSearchSubmit}
                >
                  <i className="fas fa-search mr-2"></i>搜索
                </button>
              </div>
            </div>
            
            {/* 列表展示 */}
            <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary">成果列表</h3>
                <div className="text-sm text-text-muted">共找到 <span className="text-secondary font-medium">24</span> 条成果</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">成果名称</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">分数</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">类型</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">学生姓名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">指导老师</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">提交时间</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((achievement, index) => (
                      <tr key={achievement.id} className={`${index < achievements.length - 1 ? 'border-b border-border-light' : ''} hover:bg-bg-gray`}>
                        <td className="py-3 px-4 text-sm text-text-primary">{achievement.name}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{achievement.score}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">{achievement.type}</td>
                        <td className="py-3 px-4 text-sm text-text-primary">
                          <div className="flex items-center">
                            <img 
                              src={achievement.studentAvatar} 
                              alt="学生头像" 
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            {achievement.studentName}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-primary">{achievement.teacherName}</td>
                        <td className="py-3 px-4 text-sm text-text-muted">{achievement.submitTime}</td>
                        <td className="py-3 px-4">
                          <button 
                            className="px-3 py-1 text-xs bg-secondary text-white rounded-full hover:bg-accent transition-colors"
                            onClick={() => handleViewDetail(achievement.id)}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-text-muted">显示 1-5 条，共 24 条</div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled
                    onClick={handlePrevPage}
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>
                  <button className="px-3 py-1 bg-secondary text-white rounded-lg">1</button>
                  <button className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray">2</button>
                  <button className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray">3</button>
                  <button className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray">4</button>
                  <button className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray">5</button>
                  <button 
                    className="px-3 py-1 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray"
                    onClick={handleNextPage}
                  >
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementViewPage;

