

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  views?: string;
  location?: string;
  deadline?: string;
  source?: string;
  imageUrl: string;
  imageAlt: string;
  imageCategory: string;
}

const MediaConsultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'activities' | 'industry'>('news');
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 媒体咨询';
    return () => { document.title = originalTitle; };
  }, []);

  const newsData: NewsItem[] = [
    {
      id: 'news-1',
      title: '河北师范大学软件学院2024年春季学期开学通知',
      content: '亲爱的同学们，新学期即将开始，现将2024年春季学期开学相关事宜通知如下：报到时间为2月25日-26日，上课时间为2月27日...',
      date: '2024-01-15',
      views: '1,234 次阅读',
      imageUrl: 'https://s.coze.cn/image/-gcLAiOUyvw/',
      imageAlt: '学院教学楼',
      imageCategory: '建筑城市'
    },
    {
      id: 'news-2',
      title: '软件学院荣获"河北省优秀教学团队"称号',
      content: '近日，河北省教育厅公布了2023年度省级优秀教学团队评选结果，我院软件工程专业教学团队荣获"河北省优秀教学团队"称号...',
      date: '2024-01-12',
      views: '856 次阅读',
      imageUrl: 'https://s.coze.cn/image/Tsh_5O32nLs/',
      imageAlt: '获奖证书',
      imageCategory: '商业科技'
    },
    {
      id: 'news-3',
      title: '学院成功举办2023年度学生创新创业成果展',
      content: '12月28日，我院在图书馆报告厅成功举办2023年度学生创新创业成果展，共展出优秀项目35项，涵盖人工智能、大数据、移动应用等多个领域...',
      date: '2024-01-10',
      views: '672 次阅读',
      imageUrl: 'https://s.coze.cn/image/rolWcd783ls/',
      imageAlt: '成果展现场',
      imageCategory: '商业科技'
    },
    {
      id: 'news-4',
      title: '关于开展2024年国家奖学金评选工作的通知',
      content: '根据学校统一部署，现将2024年国家奖学金评选工作相关事宜通知如下：申请时间为1月20日-25日，符合条件的同学请及时提交申请材料...',
      date: '2024-01-08',
      views: '945 次阅读',
      imageUrl: 'https://s.coze.cn/image/opRD_gSzteI/',
      imageAlt: '奖学金证书',
      imageCategory: '商业科技'
    },
    {
      id: 'news-5',
      title: '学院新增3门省级一流本科课程',
      content: '近日，河北省教育厅公布了2023年省级一流本科课程认定结果，我院《数据结构》、《软件工程》、《人工智能导论》3门课程成功入选...',
      date: '2024-01-05',
      views: '532 次阅读',
      imageUrl: 'https://s.coze.cn/image/JuXWkxisbko/',
      imageAlt: '课程教材',
      imageCategory: '商业科技'
    }
  ];

  const activitiesData: NewsItem[] = [
    {
      id: 'activity-1',
      title: '"编程之星"校园算法大赛报名启动',
      content: '为提升学生算法编程能力，学院将于3月举办"编程之星"校园算法大赛，比赛分为初赛和决赛两个阶段，奖品丰厚，欢迎同学们积极参与...',
      date: '2024-01-14',
      deadline: '截止时间：2024-02-20',
      imageUrl: 'https://s.coze.cn/image/obz9cW6aClY/',
      imageAlt: '算法大赛海报',
      imageCategory: '商业科技'
    },
    {
      id: 'activity-2',
      title: '软件学院2024年春季学期双选会邀请函',
      content: '我院将于3月15日举办2024年春季学期毕业生双选会，已有50余家知名企业确认参会，提供就业岗位200余个，欢迎各年级学生参加...',
      date: '2024-01-11',
      location: '地点：学院体育馆',
      imageUrl: 'https://s.coze.cn/image/lsWQXgFmPzw/',
      imageAlt: '双选会现场',
      imageCategory: '商业科技'
    },
    {
      id: 'activity-3',
      title: '寒假社会实践活动成果分享会',
      content: '为展示寒假社会实践成果，分享实践经验，学院将于2月28日举办寒假社会实践成果分享会，优秀团队将进行现场展示和经验交流...',
      date: '2024-01-09',
      deadline: '时间：2024-02-28 14:00',
      imageUrl: 'https://s.coze.cn/image/AU8K94vbX58/',
      imageAlt: '社会实践',
      imageCategory: '商业科技'
    }
  ];

  const industryData: NewsItem[] = [
    {
      id: 'industry-1',
      title: '2024年人工智能发展趋势报告发布',
      content: '最新发布的《2024年人工智能发展趋势报告》显示，生成式AI、大模型技术、AI芯片等领域将成为今年发展热点，预计相关市场规模将增长35%...',
      date: '2024-01-13',
      source: '来源：科技日报',
      imageUrl: 'https://s.coze.cn/image/z6BFgSLSZjk/',
      imageAlt: '人工智能',
      imageCategory: '商业科技'
    },
    {
      id: 'industry-2',
      title: '中国软件产业规模突破10万亿元大关',
      content: '据工信部最新数据，2023年中国软件产业规模达到10.8万亿元，同比增长12.3%，软件和信息技术服务业已成为国民经济的重要支柱产业...',
      date: '2024-01-11',
      source: '来源：工信部',
      imageUrl: 'https://s.coze.cn/image/FByDy58LMb0/',
      imageAlt: '软件产业',
      imageCategory: '商业科技'
    },
    {
      id: 'industry-3',
      title: '元宇宙技术在教育领域的应用前景分析',
      content: '随着元宇宙技术的快速发展，其在教育领域的应用前景日益广阔。虚拟现实、增强现实技术正在改变传统教学模式，为个性化学习提供新可能...',
      date: '2024-01-07',
      source: '来源：教育信息化',
      imageUrl: 'https://s.coze.cn/image/sSoK9XGfdhY/',
      imageAlt: '元宇宙',
      imageCategory: '商业科技'
    }
  ];

  const handleTabChange = (tab: 'news' | 'activities' | 'industry') => {
    setActiveTab(tab);
  };

  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = globalSearchValue;
      console.log('全局搜索:', searchTerm);
      navigate(`/project-intro?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleNewsItemClick = (title: string) => {
    console.log('点击新闻项:', title);
    // 未来可扩展到新闻详情页
  };

  const handlePaginationClick = (page: number | 'prev' | 'next') => {
    if (page === 'prev') {
      console.log('上一页');
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else if (page === 'next') {
      console.log('下一页');
      setCurrentPage(currentPage + 1);
    } else {
      console.log('跳转到第', page, '页');
      setCurrentPage(page);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // 可以在这里添加清除用户登录状态的逻辑
    navigate('/login');
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'news':
        return newsData;
      case 'activities':
        return activitiesData;
      case 'industry':
        return industryData;
      default:
        return newsData;
    }
  };

  const renderNewsItem = (item: NewsItem) => (
    <div
      key={item.id}
      className={`border border-border-light rounded-lg p-4 cursor-pointer ${styles.newsItemHover}`}
      onClick={() => handleNewsItemClick(item.title)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2 hover:text-[#FF6600] transition-colors">
            {item.title}
          </h3>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed">
            {item.content}
          </p>
          <div className="flex items-center text-xs text-text-muted">
            <i className="fas fa-calendar mr-1"></i>
            <span>{item.date}</span>
            <span className="mx-2">|</span>
            {item.views && (
              <>
                <i className="fas fa-eye mr-1"></i>
                <span>{item.views}</span>
              </>
            )}
            {item.deadline && (
              <>
                <i className="fas fa-clock mr-1"></i>
                <span>{item.deadline}</span>
              </>
            )}
            {item.location && (
              <>
                <i className="fas fa-map-marker-alt mr-1"></i>
                <span>{item.location}</span>
              </>
            )}
            {item.source && (
              <>
                <i className="fas fa-external-link-alt mr-1"></i>
                <span>{item.source}</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-4">
          <img
            src={item.imageUrl}
            alt={item.imageAlt}
            data-category={item.imageCategory}
            className="w-24 h-16 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );

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
                src="https://s.coze.cn/image/B1f6JTZLkso/"
                alt="用户头像"
                data-category="人物"
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
              <Link
                to="/home"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              >
                <i className="fas fa-home text-lg"></i>
                <span className="font-medium">首页</span>
              </Link>
            </li>
            <li>
              <Link
                to="/project-intro"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              >
                <i className="fas fa-folder-open text-lg"></i>
                <span className="font-medium">成果发布</span>
              </Link>
            </li>
            <li>
              <Link
                to="/business-process"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              >
                <i className="fas fa-sitemap text-lg"></i>
                <span className="font-medium">成果管理</span>
              </Link>
            </li>
            <li>
              <Link
                to="/student-info"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              >
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">媒体咨询</h2>
              <nav className="text-sm text-text-muted">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span className="text-[#FF6600]">媒体咨询</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="bg-bg-light rounded-2xl shadow-card p-6">
          {/* 标签页切换 */}
          <div className="mb-6">
            <div className="flex space-x-4" role="tablist">
              <button
                onClick={() => handleTabChange('news')}
                className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none ${
                  activeTab === 'news' ? styles.tabActive : styles.tabInactive
                }`}
                role="tab"
                aria-controls="news-content"
              >
                <i className="fas fa-bullhorn mr-2"></i>
                新闻公告
              </button>
              <button
                onClick={() => handleTabChange('activities')}
                className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none ${
                  activeTab === 'activities' ? styles.tabActive : styles.tabInactive
                }`}
                role="tab"
                aria-controls="activities-content"
              >
                <i className="fas fa-calendar-alt mr-2"></i>
                活动通知
              </button>
              <button
                onClick={() => handleTabChange('industry')}
                className={`px-6 py-3 text-sm font-medium rounded-lg focus:outline-none ${
                  activeTab === 'industry' ? styles.tabActive : styles.tabInactive
                }`}
                role="tab"
                aria-controls="industry-content"
              >
                <i className="fas fa-industry mr-2"></i>
                行业资讯
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="space-y-4">
            {getCurrentTabData().map(renderNewsItem)}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePaginationClick('prev')}
              className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={() => handlePaginationClick(1)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 1 ? 'bg-[#FF6600] text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'
              }`}
            >
              1
            </button>
            <button
              onClick={() => handlePaginationClick(2)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 2 ? 'bg-[#FF6600] text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'
              }`}
            >
              2
            </button>
            <button
              onClick={() => handlePaginationClick(3)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 3 ? 'bg-[#FF6600] text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'
              }`}
            >
              3
            </button>
            <span className="px-3 py-2 text-text-muted">...</span>
            <button
              onClick={() => handlePaginationClick(5)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === 5 ? 'bg-[#FF6600] text-white' : 'border border-border-light text-text-secondary hover:bg-gray-50'
              }`}
            >
              5
            </button>
            <button
              onClick={() => handlePaginationClick('next')}
              className="px-3 py-2 border border-border-light rounded-lg text-text-muted hover:bg-gray-50"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MediaConsultPage;

