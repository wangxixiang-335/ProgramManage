

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import styles from './styles.module.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  const [userName, setUserName] = useState<string>('用户');

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
    fetchUserInfo();
  }, [user?.id]);



  const handleGlobalSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/project-intro?search=${encodeURIComponent(globalSearchTerm)}`);
    }
  };



  const handleUserAvatarClick = () => {
    navigate('/personal-center');
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('获取用户信息失败:', error);
        return;
      }

      if (data) {
        setUserName(data.full_name || data.username || '用户');
      }
    } catch (error) {
      console.error('获取用户信息异常:', error);
    }
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
              <span className="text-sm font-medium text-text-primary">{userName}</span>
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


      </main>
    </div>
  );
};

export default HomePage;

