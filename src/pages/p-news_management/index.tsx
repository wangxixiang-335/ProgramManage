

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';
import { 
  getNewsCategories, 
  getNewsList, 
  createNews, 
  updateNews, 
  deleteNews,
  type NewsCategory as INewsCategory,
  type NewsItem as INewsItem,
  type NewsFormData
} from '../../services/supabaseNewsService';
import { 
  uploadToNewsImagesBucket,
  deleteFromNewsImagesBucket,
  checkNewsImagesBucket
} from '../../services/supabaseStorageService';
import { setupStorageOnInit } from '../../utils/initSupabaseStorage';
import { debugStorageAccess } from '../../utils/debugStorageAccess';


// 使用从newsService导入的类型
type NewsCategory = INewsCategory;
type NewsItem = INewsItem;

const NewsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string>('');
  const [activeNavItem, setActiveNavItem] = useState('news-link');
  
  // 数据加载状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 搜索和筛选状态
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  
  // 表单状态
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('');
  const [newsContent, setNewsContent] = useState('请输入新闻内容...');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // 图片上传状态
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isFixingBucket, setIsFixingBucket] = useState(false);
  const [fixStatus, setFixStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // 动态数据
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([]);

  // 动态数据
  const [newsList, setNewsList] = useState<NewsItem[]>([]);





  // 数据获取函数
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 并行获取新闻分类和新闻列表
      const [categoriesData, newsData] = await Promise.all([
        getNewsCategories(),
        getNewsList()
      ]);
      
      setNewsCategories(categoriesData);
      setNewsList(newsData);
      console.log('数据加载成功:', { categories: categoriesData, news: newsData });
    } catch (err) {
      console.error('数据加载失败:', err);
      setError(err instanceof Error ? err.message : '数据加载失败');
      
      // 如果API失败，使用备用静态数据
      const fallbackCategories: NewsCategory[] = [
        {"id":"292869b1-2083-48ab-a236-23fe38fbee04","name":"通知公告","created_at":"2025-11-21 02:41:11.193907+00"},
        {"id":"6799def2-0140-4529-b0cf-9d4ac51f7ec2","name":"学生作品","created_at":"2025-11-21 02:41:11.193907+00"},
        {"id":"7f463220-3b2d-4162-a36d-45059b4c5624","name":"师资力量","created_at":"2025-11-21 02:41:11.193907+00"},
        {"id":"e3293699-59b9-459b-a597-e9bf713434d5","name":"学院动态","created_at":"2025-11-21 02:41:11.193907+00"},
        {"id":"fdf48745-bf37-4e44-89ea-6bdf715d6bb5","name":"活动赛事","created_at":"2025-11-21 02:41:11.193907+00"}
      ];
      
      const fallbackNews: NewsItem[] = [
    
    
    
        {"id":"f32d53fd-ec28-4e8b-835d-7ab9d6f1cd3c","title":"我院学子在创新设计大赛中斩获佳绩","content":"在2024年全国大学生创新设计大赛中，我院学生团队的作品\u0022智能垃圾分类系统\u0022获得全国二等奖。该作品运用人工智能技术实现垃圾分类的智能化识别和处理，具有良好的实用性和推广价值。团队成员包括软件工程专业的张明、李华等同学，他们在导师指导下历时半年完成。","category_id":"6799def2-0140-4529-b0cf-9d4ac51f7ec2","is_top":false,"published_at":"2024-07-10 15:30:00+00","is_pinned":false,"image_url":"创新.png"}
      ];
      
      setNewsCategories(fallbackCategories);
      setNewsList(fallbackNews);
    } finally {
      setIsLoading(false);
    }
  };

  // 设置页面标题并获取数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 新闻管理';
    
    // 获取数据
    fetchData();
    
    // 初始化Supabase存储桶
    setupStorageOnInit();
    
    // 检查news-images存储桶状态
    checkNewsImagesBucket().then(exists => {
      if (exists) {
        console.log('✅ news-images存储桶已就绪');
      } else {
        console.log('⚠️ news-images存储桶不存在，将在首次上传时创建');
      }
    });
    
    // 开发环境下暴露调试功能
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      (window as any).debugNewsStorage = debugStorageAccess;
      (window as any).checkNewsImagesBucket = checkNewsImagesBucket;
      (window as any).checkNewsImagesBucket = checkNewsImagesBucket;
      
      console.log('💡 运行 debugNewsStorage() 来诊断存储问题');
      console.log('💡 运行 checkNewsImagesBucket() 检查news-images桶状态');
    }
    
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 导航项点击处理
  const handleNavItemClick = (itemId: string, href: string) => {
    setActiveNavItem(itemId);
    
    // 如果是当前页面的链接，阻止跳转
    if (itemId === activeNavItem) {
      return;
    }
    
    // 对于其他页面，执行跳转
    if (href === '/login') {
      if (confirm('确定要退出登录吗？')) {
        navigate(href);
      }
    } else {
      navigate(href);
    }
  };

  // 打开新增新闻模态框
  const handleAddNewsClick = () => {
    setIsEditing(false);
    setEditingNewsId('');
    setNewsTitle('');
    setNewsCategory('');
    setNewsContent('请输入新闻内容...');
    setUploadedImages([]);
    setIsNewsModalOpen(true);
  };

  // 打开编辑新闻模态框
  const handleEditNewsClick = async (newsId: string) => {
    setIsEditing(true);
    setEditingNewsId(newsId);
    
    try {
      // 填充表单数据
      const newsItem = newsList.find(item => item.id === newsId);
      if (newsItem) {
        setNewsTitle(newsItem.title);
        setNewsCategory(newsItem.category_id);
        setNewsContent(newsItem.content || '请输入新闻内容...');
        
        // 设置已上传的图片
        if (newsItem.image_url) {
          setUploadedImages([newsItem.image_url]);
        } else {
          setUploadedImages([]);
        }
      }
    } catch (error) {
      console.error('加载新闻数据失败:', error);
      alert('加载新闻数据失败，请重试');
      return;
    }
    
    setIsNewsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsNewsModalOpen(false);
    setImageUploadError(null);
    setFixStatus('');
  };

  // 处理图片上传到news-images桶
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 获取第一个文件（支持后续扩展为多文件）
    const file = files[0];
    
    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      setImageUploadError('只能上传图片文件！');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 增加到10MB
      setImageUploadError('图片文件大小不能超过10MB！');
      return;
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    setIsUploadingImage(true);
    setImageUploadError(null);
    setUploadProgress(0);

    try {
      console.log('开始上传到news-images桶:', file.name, `大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // 模拟上传进度（实际项目中可以根据Supabase的API调整）
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 300);
      
      const uploadResult = await uploadToNewsImagesBucket(file);
      
      // 完成进度
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (uploadResult.success && uploadResult.url) {
        setUploadedImages(prev => [...prev, uploadResult.url!]);
        console.log('✅ 图片上传到news-images桶成功:', uploadResult.url);
        
        // 显示成功提示
        setImageUploadError(null);
        
        // 延迟清除进度和预览
        setTimeout(() => {
          setUploadProgress(0);
          setPreviewImage(null);
        }, 1000);
      } else {
        setImageUploadError(uploadResult.error || '图片上传失败，请重试');
        console.error('❌ 图片上传失败:', uploadResult.error);
        
        // 清除状态
        setTimeout(() => {
          setUploadProgress(0);
          setPreviewImage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('❌ 图片上传过程中发生错误:', error);
      setImageUploadError('图片上传过程中发生未知错误');
      
      setTimeout(() => {
        setUploadProgress(0);
        setPreviewImage(null);
      }, 2000);
    } finally {
      setIsUploadingImage(false);
    }

    // 清空文件输入和预览
    e.target.value = '';
  };

  // 处理拖拽进入
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-green-600', 'bg-green-50');
  };

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-green-600', 'bg-green-50');
  };

  // 处理文件拖放
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-green-600', 'bg-green-50');
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // 创建模拟的文件输入事件
    const mockEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;
    
    await handleImageUpload(mockEvent);
  };

  // 清除预览
  const clearPreview = () => {
    setPreviewImage(null);
    setUploadProgress(0);
  };

  // 删除从news-images桶上传的图片
  const handleRemoveUploadedImage = (index: number) => {
    const imageUrl = uploadedImages[index];
    
    if (imageUrl) {
      console.log('删除从news-images桶上传的图片:', imageUrl);
      
      deleteFromNewsImagesBucket(imageUrl)
        .then(success => {
          if (success) {
            console.log('✅ 图片从news-images桶删除成功');
          } else {
            console.error('❌ 图片从news-images桶删除失败');
          }
        })
        .catch(error => {
          console.error('❌ 删除图片时发生错误:', error);
        });
    }
    
    // 从本地状态中移除
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // 保存新闻
  const handleSaveNews = async () => {
    if (!newsTitle.trim()) {
      alert('请输入新闻标题！');
      return;
    }
    
    if (!newsCategory) {
      alert('请选择新闻类型！');
      return;
    }
    
    if (!newsContent.trim() || newsContent === '请输入新闻内容...') {
      alert('请输入新闻内容！');
      return;
    }

    try {
      if (isEditing && editingNewsId) {
        // 编辑新闻
        const newsData: Partial<NewsFormData> = {
          title: newsTitle,
          content: newsContent,
          category_id: newsCategory,
          image_url: uploadedImages.length > 0 ? uploadedImages[0] : ''
        };

        await updateNews(editingNewsId, newsData);
        
        // 更新本地状态
        setNewsList(prevList => 
          prevList.map(item => 
            item.id === editingNewsId 
              ? { 
                  ...item, 
                  ...newsData
                }
              : item
          )
        );
        alert('新闻编辑成功！');
      } else {
        // 新增新闻
        const newsData: NewsFormData = {
          title: newsTitle,
          content: newsContent,
          category_id: newsCategory,
          image_url: uploadedImages.length > 0 ? uploadedImages[0] : '',
          is_top: false,
          is_pinned: false
        };

        const newNews = await createNews(newsData);
        
        // 更新本地状态
        setNewsList(prevList => [newNews, ...prevList]);
        alert('新闻新增成功！');
      }
    } catch (error) {
      console.error('保存新闻失败:', error);
      alert('保存失败，请重试！');
      
      // 如果API失败，使用本地更新作为备用方案
      if (isEditing && editingNewsId) {
        setNewsList(prevList => 
          prevList.map(item => 
            item.id === editingNewsId 
              ? { 
                  ...item, 
                  title: newsTitle, 
                  content: newsContent,
                  category_id: newsCategory,
                  image_url: uploadedImages.length > 0 ? uploadedImages[0] : ''
                }
              : item
          )
        );
      } else {
        const newId = String(Date.now());
        // 本地状态临时对象
        // 实际的id会由Supabase自动生成
        const tempNews: NewsItem = {
          id: newId,       // 仅用于本地显示
          title: newsTitle,
          content: newsContent,
          category_id: newsCategory,
          is_top: false,
          is_pinned: false,
          published_at: new Date().toISOString(),
          image_url: uploadedImages.length > 0 ? uploadedImages[0] : ''
        };
        setNewsList(prevList => [newNews, ...prevList]);
      }
    }
    
    handleCloseModal();
  };

  // 删除新闻
  const handleDeleteNews = async (newsId: string) => {
    if (confirm('确定要删除这条新闻吗？')) {
      try {
        await deleteNews(newsId);
        
        // 更新本地状态
        setNewsList(prevList => prevList.filter(item => item.id !== newsId));
        alert('新闻删除成功！');
      } catch (error) {
        console.error('删除新闻失败:', error);
        alert('删除失败，请重试！');
        
        // 如果API失败，仍然更新本地状态
        setNewsList(prevList => prevList.filter(item => item.id !== newsId));
      }
    }
  };

  // 搜索处理
  const handleSearchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('搜索: ' + nameSearch);
      // 在实际应用中，这里会执行搜索
    }
  };

  // 根据category_id获取栏目名称
  const getCategoryName = (categoryId: string): string => {
    const category = newsCategories.find(cat => cat.id === categoryId);
    return category ? category.name : '未分类';
  };

  // 修复存储桶问题
  const handleFixBucket = async () => {
    setIsFixingBucket(true);
    setFixStatus('正在修复news-images存储桶...');
    
    try {
      // 直接检查news-images桶
      const bucketExists = await checkNewsImagesBucket();
      
      if (!bucketExists) {
        setFixStatus('❌ news-images存储桶不存在，请在Supabase Dashboard中手动创建。');
      } else {
        setFixStatus('✅ news-images存储桶已存在，可以正常上传图片！');
        setTimeout(() => setFixStatus(''), 5000);
      }
    } catch (error) {
      console.error('检查存储桶时发生错误:', error);
      setFixStatus('❌ 检查过程中发生错误，请查看控制台。');
    } finally {
      setIsFixingBucket(false);
    }
  };

  // 根据category_id获取栏目颜色
  const getCategoryColor = (categoryId: string): string => {
    const category = newsCategories.find(cat => cat.id === categoryId);
    const name = category ? category.name : '';
    
    const colorMap: { [key: string]: string } = {
      '通知公告': 'bg-green-100 text-secondary',
      '学生作品': 'bg-purple-100 text-purple-600',
      '师资力量': 'bg-blue-100 text-blue-600',
      '学院动态': 'bg-orange-100 text-orange-600',
      '活动赛事': 'bg-red-100 text-red-600'
    };
    return colorMap[name] || 'bg-gray-100 text-gray-600';
  };

  // 格式化发布时间
  const formatPublishDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(/\//g, '-');
  };

  // 处理内容变化
  const handleContentChange = (content: string) => {
    // 清理内容：移除多余的空白和特殊字符
    const cleanedContent = content
      .replace(/\u200B/g, '') // 移除零宽度空格
      .replace(/\u00A0/g, ' ') // 替换不间断空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
    
    setNewsContent(cleanedContent);
    console.log('新闻内容已更新:', cleanedContent);
  };



  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="bg-bg-light shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-shield text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">软院项目通</h1>
              <p className="text-xs text-text-muted">管理员后台</p>
            </div>
          </div>
          
          {/* 右侧用户信息 */}
          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100">
              <i className="fas fa-bell text-text-secondary"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600">
                <i className="fas fa-user"></i>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user?.full_name || '管理员'}</p>
                <p className="text-xs text-text-muted">系统管理员</p>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-muted"></i>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 */}
        <aside className={`w-64 bg-bg-light shadow-sidebar flex-shrink-0 hidden md:block ${isMobileMenuOpen ? 'fixed inset-0 z-40' : ''}`}>
          <nav className="py-4">
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">主要功能</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/admin-home"
                    onClick={() => handleNavItemClick('dashboard-link', '/admin-home')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'dashboard-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management"
                    onClick={() => handleNavItemClick('carousel-link', '/carousel-management')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'carousel-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management"
                    onClick={() => handleNavItemClick('news-link', '/news-management')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-green-600 rounded-r-lg ${activeNavItem === 'news-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management"
                    onClick={() => handleNavItemClick('achievements-link', '/achievement-library-management')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'achievements-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management"
                    onClick={() => handleNavItemClick('knowledge-link', '/knowledge-base-management')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'knowledge-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-book w-5 text-center mr-3"></i>
                    <span>知识库管理</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="px-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">系统设置</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/user-management"
                    onClick={() => handleNavItemClick('users-link', '/user-management')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'users-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login"
                    onClick={() => handleNavItemClick('logout-link', '/login')}
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${activeNavItem === 'logout-link' ? styles.sidebarItemActive : ''}`}
                  >
                    <i className="fas fa-sign-out-alt w-5 text-center mr-3"></i>
                    <span>退出登录</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>
        
        {/* 移动端菜单按钮 */}
        <button 
          onClick={handleMobileMenuToggle}
          className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg z-50"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 页面标题 */}
          <div className={`mb-6 ${styles.fadeIn}`}>
            <h2 className="text-2xl font-bold text-text-primary">新闻管理</h2>
            <p className="text-text-muted mt-1">管理系统中的所有新闻内容</p>
          </div>
          
          {/* 搜索栏 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-4 mb-6 ${styles.fadeInDelay1}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-wrap gap-3 flex-1">
                {/* 栏目选择 */}
                <div className="w-full md:w-auto">
                  <label htmlFor="category-select" className="block text-sm font-medium text-text-secondary mb-1">栏目</label>
                  <select 
                    id="category-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`w-full md:w-40 px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 ${styles.customSelect}`}
                  >
                    <option value="">全部栏目</option>
                    {newsCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  </select>
                </div>
                
                {/* 类型选择 */}
                <div className="w-full md:w-auto">
                  <label htmlFor="type-select" className="block text-sm font-medium text-text-secondary mb-1">类型</label>
                  <select 
                    id="type-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`w-full md:w-40 px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 ${styles.customSelect}`}
                  >
                    <option value="">全部类型</option>
                    <option value="important">重要</option>
                    <option value="normal">普通</option>
                  </select>
                </div>
                
                {/* 日期选择 */}
                <div className="w-full md:w-auto">
                  <label htmlFor="date-select" className="block text-sm font-medium text-text-secondary mb-1">日期</label>
                  <select 
                    id="date-select"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`w-full md:w-40 px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 ${styles.customSelect}`}
                  >
                    <option value="">全部日期</option>
                    <option value="today">今天</option>
                    <option value="week">本周</option>
                    <option value="month">本月</option>
                    <option value="year">今年</option>
                  </select>
                </div>
                
                {/* 名称搜索 */}
                <div className="w-full md:flex-1">
                  <label htmlFor="name-search" className="block text-sm font-medium text-text-secondary mb-1">名称</label>
                  <div className="relative">
                    <input 
                      type="text"
                      id="name-search"
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      onKeyUp={handleSearchKeyUp}
                      placeholder="搜索新闻名称..." 
                      className="w-full pl-10 pr-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="w-full md:w-auto flex gap-2">
                <label className="block text-sm font-medium text-transparent mb-1">操作</label>
                <button 
                  onClick={fetchData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  title="刷新数据"
                >
                  <i className={`fas fa-sync-alt mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
                  <span>刷新</span>
                </button>
                <button 
                  onClick={handleAddNewsClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-plus mr-2"></i>
                  <span>新增</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 列表展示 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-4 mb-6 ${styles.fadeInDelay2}`}>
            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                  <span className="text-red-700">{error}</span>
                  <button 
                    onClick={fetchData}
                    className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-image text-green-600 text-xl"></i>
                  </div>
                </div>
                <div className="mt-4 text-center space-y-2">
                  <p className="text-lg font-medium text-gray-700">正在加载数据...</p>
                  <div className="flex space-x-2 justify-center">
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse delay-75"></div>
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
                  </div>
                  <p className="text-sm text-gray-500">请稍候片刻</p>
                </div>
              </div>
            )}
            
            {/* 数据表格 */}
            {!isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">类型</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">新闻图片</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">新闻名</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">新闻内容</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">发布时间</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">操作</th>
                    </tr>
                  </thead>
                <tbody>
                  {newsList.map((newsItem, index) => (
                    <tr 
                      key={newsItem.id} 
                      className={`${index < newsList.length - 1 ? 'border-b border-border-light' : ''} hover:bg-gray-50`}
                    >
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        <span className={`px-2 py-1 ${getCategoryColor(newsItem.category_id)} rounded-full text-xs`}>
                          {getCategoryName(newsItem.category_id)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {newsItem.image_url ? (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            <img 
                              src={newsItem.image_url} 
                              alt={newsItem.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDE0IDI5LjMxMzcgMTQgMjZDMTQgMjIuNjg2MyAxNi42ODYzIDIwIDIwIDIwQzIzLjMxMzcgMjAgMjYgMjIuNjg2MyAyNiAyNkMyNiAyOS4zMTM3IDIzLjMxMzcgMzIgMjAgMzJaIiBmaWxsPSIjOUI5QjlBIi8+CjxwYXRoIGQ9Ik00NCAzMkM0MC42ODYzIDMyIDM4IDI5LjMxMzcgMzggMjZDMzggMjIuNjg2MyA0MC42ODYzIDIwIDQ0IDIwQzQ3LjMxMzcgMjAgNTAgMjIuNjg2MyA1MCAyNkM1MCAyOS4zMTM3IDQ3LjMxMzcgMzIgNDQgMzJaIiBmaWxsPSIjOUI5QjlBIi8+CjxwYXRoIGQ9Ik0yMCA0NEwxNiA1MEg0OFw0NCA0NEgyMFoiIGZpbGw9IiM5QjlCOWEiLz4KPC9zdmc+';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-image text-gray-400"></i>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-text-primary font-medium">{newsItem.title}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary max-w-xs">
                        <div className="truncate" title={newsItem.content}>
                          {newsItem.content}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-muted">{formatPublishDate(newsItem.published_at)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditNewsClick(newsItem.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <i className="fas fa-edit"></i>
                            <span className="ml-1">编辑</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteNews(newsItem.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-trash"></i>
                            <span className="ml-1">删除</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
            
            {/* 分页 */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-text-muted">
                显示 1 至 {newsList.length} 条，共 48 条
              </div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button className="px-3 py-1 border border-green-600 bg-green-600 text-white rounded-md">1</button>
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50">3</button>
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50">4</button>
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50">5</button>
                <button className="px-3 py-1 border border-border-light rounded-md text-text-secondary hover:bg-gray-50">
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* 新增/编辑新闻模态框 */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={styles.modalBackdrop} onClick={handleCloseModal}></div>
          <div className="bg-bg-light rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-5 border-b border-border-light">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-text-primary">
                  {isEditing ? '编辑新闻' : '新增新闻'}
                </h3>
                <button onClick={handleCloseModal} className="text-text-muted hover:text-text-primary">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <form>
                {/* 新闻名称 */}
                <div className="mb-4">
                  <label htmlFor="news-title" className="block text-sm font-medium text-text-secondary mb-1">
                    新闻名称 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    id="news-title"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600" 
                    placeholder="请输入新闻名称"
                  />
                </div>
                
                {/* 新闻类型 */}
                <div className="mb-4">
                  <label htmlFor="news-category" className="block text-sm font-medium text-text-secondary mb-1">
                    新闻类型 <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="news-category"
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  >
                    <option value="">请选择新闻类型</option>
                    {newsCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  </select>
                </div>
                
                {/* 新闻内容 */}
                <div className="mb-4">
                  <label htmlFor="news-content" className="block text-sm font-medium text-text-secondary mb-1">
                    新闻内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="news-content"
                    className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 resize-vertical focus:outline-none"
                    value={newsContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="请输入新闻内容..."
                    rows={6}
                    style={{
                      minHeight: '120px',
                      maxHeight: '300px',
                      lineHeight: '1.5',
                      resize: 'vertical'
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 提示：在此处输入新闻内容，支持多行文本
                  </div>
                </div>
                
                {/* 上传图片 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary mb-1">上传图片</label>
                  
                  {/* 预览区域 */}
                  {previewImage && (
                    <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium text-gray-700">图片预览</div>
                        <button
                          type="button"
                          onClick={clearPreview}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          title="清除预览"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="flex items-center justify-center">
                        <img 
                          src={previewImage} 
                          alt="预览图片"
                          className="max-w-xs max-h-40 object-contain rounded border border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 上传区域 */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                      isUploadingImage 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-border-light hover:border-green-600 hover:bg-green-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file"
                      id="image-upload"
                      onChange={handleImageUpload}
                      className="hidden" 
                      accept="image/*" 
                      disabled={isUploadingImage}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className={`cursor-pointer transition-all duration-300 ${
                        isUploadingImage ? 'pointer-events-none' : 'hover:text-green-600'
                      }`}
                    >
                      {isUploadingImage ? (
                        <div className="space-y-3">
                          <div className="flex flex-col items-center space-y-2">
                            <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
                            <p className="text-sm font-medium text-blue-600">正在上传图片...</p>
                            
                            {/* 进度条 */}
                            {uploadProgress > 0 && (
                              <div className="w-full max-w-xs">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>上传进度</span>
                                  <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-blue-500">正在快速上传到云端...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <i className="fas fa-cloud-upload-alt text-4xl text-text-muted"></i>
                          <p className="text-lg font-medium text-text-secondary">点击或拖拽图片到此处上传</p>
                          <p className="text-sm text-text-muted">支持 JPG、PNG、GIF、WebP 格式</p>
                          <p className="text-xs text-text-muted mt-1">最大支持 10MB，建议压缩后上传</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {/* 上传错误信息 */}
                  {imageUploadError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                      <i className="fas fa-exclamation-circle mr-1"></i>
                      {imageUploadError}
                      {imageUploadError.includes('news-images存储桶') && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={handleFixBucket}
                            disabled={isFixingBucket}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isFixingBucket ? '修复中...' : '修复存储桶'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 修复状态信息 */}
                  {fixStatus && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <i className="fas fa-info-circle mr-1 text-blue-600"></i>
                      {fixStatus}
                    </div>
                  )}
                </div>
                
                {/* 已上传图片预览 */}
                {uploadedImages.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1">已上传图片</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`上传图片 ${index + 1}`} 
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button 
                            onClick={() => handleRemoveUploadedImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-5 border-t border-border-light flex justify-end space-x-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={handleSaveNews}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;

