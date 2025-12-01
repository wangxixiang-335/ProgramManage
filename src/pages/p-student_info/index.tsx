

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

Chart.register(...registerables);

const StudentInfoPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('semester');
  const [lastUpdateTime, setLastUpdateTime] = useState('');
  const publicationChartRef = useRef<HTMLCanvasElement>(null);
  const scoreChartRef = useRef<HTMLCanvasElement>(null);
  const publicationChartInstanceRef = useRef<Chart | null>(null);
  const scoreChartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 学生端数据看板';
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  useEffect(() => {
    initCharts();
    return () => {
      if (publicationChartInstanceRef.current) {
        publicationChartInstanceRef.current.destroy();
        publicationChartInstanceRef.current = null;
      }
      if (scoreChartInstanceRef.current) {
        scoreChartInstanceRef.current.destroy();
        scoreChartInstanceRef.current = null;
      }
    };
  }, []);

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = globalSearchValue;
      console.log('全局搜索:', searchTerm);
      navigate(`/project-intro?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('退出登录');
    navigate('/login');
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeRange = e.target.value;
    setSelectedTimeRange(timeRange);
    console.log('选择的时间范围:', timeRange);
    updateCharts(timeRange);
  };

  const handleGenerateReportClick = () => {
    console.log('生成详细分析报告');
    alert('报告生成中，请稍候...');
  };

  const initCharts = () => {
    // 发布量统计图
    if (publicationChartRef.current) {
      const publicationCtx = publicationChartRef.current.getContext('2d');
      if (publicationCtx) {
        publicationChartInstanceRef.current = new Chart(publicationCtx, {
          type: 'doughnut',
          data: {
            labels: ['Web应用', '移动应用', '数据分析', '人工智能', '其他'],
            datasets: [{
              data: [4, 3, 2, 2, 1],
              backgroundColor: [
                '#FF7F50',
                '#FFA07A',
                '#FFD700',
                '#FFE4B5',
                '#FFFAF0'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = typeof context.raw === 'number' ? context.raw : 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value}个项目 (${percentage}%)`;
                  }
                }
              }
            },
            cutout: '60%'
          }
        });
      }
    }

    // 成绩折线图
    if (scoreChartRef.current) {
      const scoreCtx = scoreChartRef.current.getContext('2d');
      if (scoreCtx) {
        scoreChartInstanceRef.current = new Chart(scoreCtx, {
          type: 'line',
          data: {
            labels: ['项目1', '项目2', '项目3', '项目4', '项目5', '项目6', '项目7', '项目8'],
            datasets: [{
              label: '项目成绩',
              data: [85, 82, 88, 90, 86, 92, 89, 94],
              borderColor: '#FF7F50',
              backgroundColor: 'rgba(255, 127, 80, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#FF7F50',
              pointRadius: 5,
              pointHoverRadius: 7,
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false,
                min: 70,
                max: 100,
                ticks: {
                  stepSize: 5
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function(context) {
                    return `成绩: ${context.raw}分`;
                  }
                }
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            }
          }
        });
      }
    }
  };

  const updateCharts = (timeRange: string) => {
    console.log('更新图表数据，时间范围:', timeRange);
    // 实际应用中，这里应该从服务器获取对应时间范围的数据
    // 然后更新图表
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
                src="https://s.coze.cn/image/ZQPlwrpCTRg/" 
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
              <Link to="/business-process" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                <i className="fas fa-sitemap text-lg"></i>
                <span className="font-medium">成果管理</span>
              </Link>
            </li>
            <li>
              <a href="#" className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${styles.navItemActive}`}>
                <i className="fas fa-users text-lg"></i>
                <span className="font-medium">数据看板</span>
              </a>
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">学生端数据看板</h2>
              <nav className="text-sm text-text-muted">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span className="text-secondary">学生端数据看板</span>
              </nav>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">最后更新</p>
              <p className="text-lg font-semibold text-text-primary">{lastUpdateTime}</p>
            </div>
          </div>
        </div>

        {/* 学生信息表格 */}
        <section className="bg-bg-light rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-primary flex items-center">
              <i className="fas fa-chart-bar text-orange-500 mr-3"></i>
              个人项目数据统计与分析
            </h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select 
                  value={selectedTimeRange}
                  onChange={handleTimeRangeChange}
                  className={`w-48 pl-4 pr-10 py-2 border border-border-light rounded-lg appearance-none bg-white ${styles.searchInputFocus}`}
                >
                  <option value="month">近一个月</option>
                  <option value="quarter">近三个月</option>
                  <option value="semester">本学期</option>
                  <option value="year">近一年</option>
                </select>
                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none"></i>
              </div>
            </div>
          </div>
          
          {/* 数据概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">参与项目总数</p>
                  <h4 className="text-3xl font-bold text-text-primary mt-1">12</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <i className="fas fa-folder-open text-orange-500 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i> 15%
                </span>
                <span className="text-text-muted ml-2">相比上学期</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">平均成绩</p>
                  <h4 className="text-3xl font-bold text-text-primary mt-1">88.5</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <i className="fas fa-star text-orange-500 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i> 3.2%
                </span>
                <span className="text-text-muted ml-2">相比上学期</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm">项目完成率</p>
                  <h4 className="text-3xl font-bold text-text-primary mt-1">92%</h4>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <i className="fas fa-check-circle text-orange-500 text-xl"></i>
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <span className="text-green-500 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i> 5%
                </span>
                <span className="text-text-muted ml-2">相比上学期</span>
              </div>
            </div>
          </div>
          
          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 发布量统计图 */}
            <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
              <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-pie-chart text-orange-500 mr-2"></i>
              项目发布类型统计
              </h4>
              <div className="h-80">
                <canvas ref={publicationChartRef}></canvas>
              </div>
            </div>
            
            {/* AI分析区域 */}
            <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
              <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-robot text-orange-500 mr-2"></i>
              个人优势分析
              </h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-lightbulb text-orange-500"></i>
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-text-primary">技术能力突出</h5>
                    <p className="text-text-secondary text-sm mt-1">根据数据分析，您在软件开发和项目实施方面表现出色，尤其在前端开发领域有显著优势。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-users text-orange-500"></i>
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-text-primary">团队协作能力强</h5>
                    <p className="text-text-secondary text-sm mt-1">您参与的团队项目普遍获得较高评价，显示出良好的沟通协调和团队合作能力。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fas fa-tasks text-orange-500"></i>
                  </div>
                  <div className="ml-3">
                    <h5 className="font-medium text-text-primary">项目管理能力优秀</h5>
                    <p className="text-text-secondary text-sm mt-1">您负责的项目通常能按时或提前完成，且质量较高，展现出良好的项目规划和执行能力。</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border-light">
                  <button 
                    onClick={handleGenerateReportClick}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    生成详细分析报告
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 成绩折线图 */}
          <div className="bg-white rounded-xl shadow-card p-5 border border-border-light">
            <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-chart-line text-orange-500 mr-2"></i>
              项目成绩趋势
            </h4>
            <div className="h-80">
              <canvas ref={scoreChartRef}></canvas>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentInfoPage;

