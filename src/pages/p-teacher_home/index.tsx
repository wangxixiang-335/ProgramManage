

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatisticsService } from '../../lib/statisticsService';
import { AchievementService } from '../../lib/achievementService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

// 声明Chart.js的全局类型
declare global {
  interface Window {
    Chart: any;
  }
}

const TeacherHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(user);

  const [currentDate, setCurrentDate] = useState('');
  const [isRefreshingTypes, setIsRefreshingTypes] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    pendingCount: 0,
    publishedCount: 0,
    studentCount: 0,
    projectCount: 0
  });
  
  const publicationChartRef = useRef<any>(null);
  const [stats, setStats] = useState<any>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 教师首页';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  // 设置当前日期
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const formattedDate = now.toLocaleDateString('zh-CN', options) + '，' + weekdays[now.getDay()];
    setCurrentDate(formattedDate);
  }, []);

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

  // 获取仪表板统计数据
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        if (currentUser) {
          const stats = await StatisticsService.getTeacherDashboardStats(currentUser.id);
          setDashboardStats(stats);
        }
      } catch (error) {
        console.error('获取仪表板统计数据失败:', error);
      }
    };

    if (currentUser) {
      loadDashboardStats();
    }
  }, [currentUser]);

  // 初始化图表
  useEffect(() => {
    if (typeof window.Chart === 'undefined') {
      // 如果Chart.js未加载，可能需要动态加载
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        initializeCharts();
      };
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else {
      initializeCharts();
    }

    return () => {
      // 清理图表实例
      if (publicationChartRef.current) {
        publicationChartRef.current.destroy();
        publicationChartRef.current = null;
      }
    };
  }, []);

  const initializeCharts = async () => {
    try {
      // 获取教师统计数据
      const teacherStats = await StatisticsService.getTeacherStatistics();
      setStats(teacherStats);
      
      // 个人发布量统计图表 - 按发布类型统计（柱状图）
      const publicationCtx = document.getElementById('publication-chart') as HTMLCanvasElement;
      if (publicationCtx && !publicationChartRef.current) {
        const ctx = publicationCtx.getContext('2d');
        if (ctx) {
          // 生成动态颜色数组
          const backgroundColors = teacherStats.publicationByType.labels.map((_, index) => {
            const colors = ['#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#757575', '#E53935', '#FDD835', '#5E35B1'];
            return colors[index % colors.length];
          });

          publicationChartRef.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
              labels: teacherStats.publicationByType.labels,
              datasets: [{
                label: '发布数量',
                data: teacherStats.publicationByType.data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 2,
                borderRadius: 8
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8,
                  callbacks: {
                    label: function(context) {
                      return `${context.label}: ${context.raw}个项目`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  },
                  ticks: {
                    precision: 0
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }
          });
        }
      }


    } catch (error) {
      console.error('初始化教师图表失败:', error);
    }
  };

  const handleNavItemClick = (itemId: string, pageTitle: string) => {
    setActiveNavItem(itemId);
  };



  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNotificationClick = () => {
    alert('通知功能开发中...');
  };

  const handleRefreshTypes = () => {
    setIsRefreshingTypes(true);
    setTimeout(() => {
      setIsRefreshingTypes(false);
      // 这里可以添加刷新图表数据的逻辑
    }, 1000);
  };

  const handleLogout = () => {
    navigate('/login');
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
                  className={`flex items-center px-6 py-3 ${
                    activeNavItem === 'dashboard' 
                      ? `text-secondary ${styles.sidebarItemActive}` 
                      : `text-text-secondary ${styles.sidebarItemHover}`
                  }`}
                  onClick={() => handleNavItemClick('dashboard', '数据看板')}
                >
                  <i className="fas fa-chart-line w-6 text-center"></i>
                  <span className="ml-3 font-medium">数据看板</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-approval" 
                  className={`flex items-center px-6 py-3 ${
                    activeNavItem === 'approval' 
                      ? `text-secondary ${styles.sidebarItemActive}` 
                      : `text-text-secondary ${styles.sidebarItemHover}`
                  }`}
                  onClick={() => handleNavItemClick('approval', '成果审批')}
                >
                  <i className="fas fa-tasks w-6 text-center"></i>
                  <span className="ml-3">成果审批</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">12</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-publish" 
                  className={`flex items-center px-6 py-3 ${
                    activeNavItem === 'publish' 
                      ? `text-secondary ${styles.sidebarItemActive}` 
                      : `text-text-secondary ${styles.sidebarItemHover}`
                  }`}
                  onClick={() => handleNavItemClick('publish', '成果发布')}
                >
                  <i className="fas fa-paper-plane w-6 text-center"></i>
                  <span className="ml-3">成果发布</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-management" 
                  className={`flex items-center px-6 py-3 ${
                    activeNavItem === 'management' 
                      ? `text-secondary ${styles.sidebarItemActive}` 
                      : `text-text-secondary ${styles.sidebarItemHover}`
                  }`}
                  onClick={() => handleNavItemClick('management', '成果管理')}
                >
                  <i className="fas fa-cog w-6 text-center"></i>
                  <span className="ml-3">成果管理</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/achievement-view" 
                  className={`flex items-center px-6 py-3 ${
                    activeNavItem === 'view' 
                      ? `text-secondary ${styles.sidebarItemActive}` 
                      : `text-text-secondary ${styles.sidebarItemHover}`
                  }`}
                  onClick={() => handleNavItemClick('view', '成果查看')}
                >
                  <i className="fas fa-eye w-6 text-center"></i>
                  <span className="ml-3">成果查看</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* 底部导航 */}
          <div className="mt-auto p-4 border-t border-border-light">
            <ul>
              <li>
                <button 
                  onClick={handleLogout}
                  className={`flex items-center px-6 py-3 text-text-secondary ${styles.sidebarItemHover} w-full text-left`}
                >
                  <i className="fas fa-sign-out-alt w-6 text-center"></i>
                  <span className="ml-3">退出登录</span>
                </button>
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
              <h2 className="text-xl font-semibold text-text-primary hidden md:block">数据看板</h2>
              
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
                    src="https://s.coze.cn/image/uf-pHaNc3bk/" 
                    alt="教师头像" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-text-primary">{currentUser?.full_name || user?.full_name || '教师用户'}</p>
                    <p className="text-xs text-text-muted">计算机科学与技术系</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* 内容区域 */}
          <div className="p-6">
            {/* 欢迎信息 */}
            <div className={`mb-8 ${styles.fadeIn}`}>
              <h1 className="text-2xl font-bold text-text-primary">您好，{currentUser?.full_name || user?.full_name || '教师用户'}</h1>
              <p className="text-text-secondary mt-1">今天是 <span>{currentDate}</span></p>
            </div>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 待审批成果 */}
              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover} ${styles.fadeIn}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">待审批成果</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-2">{dashboardStats.pendingCount}</h3>
                    <p className="text-green-500 text-xs mt-1 flex items-center">
                      <i className="fas fa-clock mr-1"></i> 待处理
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-secondary">
                    <i className="fas fa-hourglass-half text-xl"></i>
                  </div>
                </div>
              </div>
              
              {/* 已发布成果 */}
              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">已发布成果</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-2">{dashboardStats.publishedCount}</h3>
                    <p className="text-green-500 text-xs mt-1 flex items-center">
                      <i className="fas fa-check mr-1"></i> 已通过
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <i className="fas fa-check-circle text-xl"></i>
                  </div>
                </div>
              </div>
              
              {/* 学生数量 */}
              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">指导学生</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-2">{dashboardStats.studentCount}</h3>
                    <p className="text-text-muted text-xs mt-1">总人数</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <i className="fas fa-users text-xl"></i>
                  </div>
                </div>
              </div>
              
              {/* 项目数量 */}
              <div className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 ${styles.cardHover} ${styles.fadeIn}`} style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-sm">负责项目</p>
                    <h3 className="text-3xl font-bold text-text-primary mt-2">{dashboardStats.projectCount}</h3>
                    <p className="text-text-muted text-xs mt-1">参与项目</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                    <i className="fas fa-project-diagram text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 图表区域 */}
            <div className="space-y-6 mb-8">
              {/* 个人发布量统计图 - 上方区域 */}
              <div className={`bg-white rounded-xl shadow-card p-6 ${styles.fadeIn}`} style={{animationDelay: '0.4s'}}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">个人发布量统计图（按发布类型统计）</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="h-80">
                      <canvas id="publication-chart"></canvas>
                    </div>
                  </div>
                  <div className="h-80 flex flex-col">
                    <h5 className="font-semibold text-text-primary mb-4">发布类型详情</h5>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {stats?.publicationByType?.labels?.map((label, index) => {
                        const count = stats.publicationByType.data[index] || 0;
                        const colors = [
                          'bg-blue-50 text-blue-600',
                          'bg-green-50 text-green-600', 
                          'bg-orange-50 text-orange-600',
                          'bg-purple-50 text-purple-600',
                          'bg-gray-50 text-gray-600',
                          'bg-red-50 text-red-600',
                          'bg-yellow-50 text-yellow-600',
                          'bg-indigo-50 text-indigo-600'
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${colorClass}`}>
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-sm font-bold">{count}个</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              

            </div>
            
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherHomePage;

