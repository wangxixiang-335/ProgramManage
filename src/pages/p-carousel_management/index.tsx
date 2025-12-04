

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BannerService } from '../../lib/bannerService';
import { Banner, BannerFilters, BANNER_STATUS_MAP } from '../../types/banner';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface BannerFormData {
  image_url: string;
  text_content: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
}

const CarouselManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 页面状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('carousel');
  const [isLoading, setIsLoading] = useState(false);
  
  // 数据状态
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalBanners, setTotalBanners] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  
  // 表单状态
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    image_url: '',
    text_content: '',
    link_url: '',
    display_order: 1,
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // 分页设置
  const itemsPerPage = 10;

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 轮播图管理';
    return () => { 
      document.title = originalTitle; 
    };
  }, []);

  // 加载轮播图数据
  useEffect(() => {
    loadBanners();
  }, [currentPage, searchKeyword, statusFilter]);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const filters: BannerFilters = {
        search: searchKeyword || undefined,
        is_active: statusFilter,
        page: currentPage,
        limit: itemsPerPage
      };
      
      const result = await BannerService.getBanners(filters);
      
      if (result.success && result.data) {
        setBanners(result.data.data);
        setTotalBanners(result.data.total);
      } else {
        alert(result.message || '获取轮播图列表失败');
      }
    } catch (error) {
      console.error('Load banners error:', error);
      alert('获取轮播图列表失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 导航项点击处理
  const handleNavItemClick = (itemId: string, href?: string) => {
    setActiveNavItem(itemId);
    if (href && href !== '#') {
      // 对于需要导航的链接，使用Link组件处理
      // 这里的事件处理主要是为了设置active状态
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      image_url: '',
      text_content: '',
      link_url: '',
      display_order: banners.length + 1,
      is_active: true
    });
    setSelectedFile(null);
    setImagePreview('');
    setEditingBanner(null);
  };

  // 打开添加轮播图模态框
  const handleAddBanner = () => {
    resetForm();
    setShowModal(true);
  };

  // 打开编辑轮播图模态框
  const handleEditBanner = async (banner: Banner) => {
    try {
      setEditingBanner(banner);
      setFormData({
        image_url: banner.image_url,
        text_content: banner.text_content,
        link_url: banner.link_url,
        display_order: banner.display_order,
        is_active: banner.is_active
      });
      setImagePreview(banner.image_url);
      setShowModal(true);
    } catch (error) {
      console.error('Edit banner error:', error);
      alert('编辑轮播图失败，请稍后重试');
    }
  };

  // 删除轮播图
  const handleDeleteBanner = async (id: string) => {
    if (confirm('确定要删除这个轮播图吗？删除后无法恢复。')) {
      try {
        const result = await BannerService.deleteBanner(id);
        
        if (result.success) {
          alert('轮播图删除成功');
          loadBanners(); // 重新加载数据
        } else {
          alert(result.message || '删除轮播图失败');
        }
      } catch (error) {
        console.error('Delete banner error:', error);
        alert('删除轮播图失败，请稍后重试');
      }
    }
  };

  // 切换轮播图状态
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const result = await BannerService.updateBannerStatus(id, newStatus);
      
      if (result.success) {
        alert(result.message);
        loadBanners(); // 重新加载数据
      } else {
        alert(result.message || '更新状态失败');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('更新状态失败，请稍后重试');
    }
  };

  // 处理图片文件选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setFormData(prev => ({ ...prev, image_url: preview }));
    }
  };

  // 处理表单字段变更
  const handleFormFieldChange = (field: keyof BannerFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text_content.trim()) {
      alert('请输入文字内容');
      return;
    }
    
    if (!formData.link_url.trim()) {
      alert('请输入跳转链接');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let finalImageUrl = formData.image_url;
      
      // 如果有新选择的图片，先上传
      if (selectedFile && imagePreview.startsWith('blob:')) {
        const uploadResult = await BannerService.uploadBannerImage(selectedFile);
        
        if (uploadResult.success && uploadResult.url) {
          finalImageUrl = uploadResult.url;
        } else {
          alert(`图片上传失败：${uploadResult.message}`);
          setIsLoading(false);
          return;
        }
      }
      
      const submitData = {
        ...formData,
        image_url: finalImageUrl
      };
      
      let result;
      if (editingBanner) {
        result = await BannerService.updateBanner(editingBanner.id, submitData);
      } else {
        result = await BannerService.createBanner(submitData);
      }
      
      if (result.success) {
        alert(result.message);
        setShowModal(false);
        resetForm();
        loadBanners(); // 重新加载数据
      } else {
        alert(result.message || '保存失败');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 分页处理
  const handlePageChange = (page: number | string) => {
    if (page === 'prev') {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else if (page === 'next') {
      setCurrentPage(currentPage + 1);
    } else if (typeof page === 'number') {
      setCurrentPage(page);
    }
  };

  // 获取总页数
  const totalPages = Math.ceil(totalBanners / itemsPerPage);

  // 用户信息点击
  const handleUserProfileClick = () => {
    console.log('打开用户菜单');
    // 在实际应用中，这里会显示用户菜单
  };

  // 通知图标点击
  const handleNotificationClick = () => {
    console.log('打开通知面板');
    // 在实际应用中，这里会显示通知面板
  };

  // 退出登录
  const handleLogout = (e: React.MouseEvent) => {
    if (confirm('确定要退出登录吗？')) {
      // 继续默认行为，跳转到登录页
    } else {
      e.preventDefault();
    }
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
            <div 
              className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100"
              onClick={handleNotificationClick}
            >
              <i className="fas fa-bell text-text-secondary"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleUserProfileClick}
            >
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
        <aside className={`w-64 bg-bg-light shadow-sidebar flex-shrink-0 hidden md:block ${
          isMobileMenuOpen ? 'fixed inset-0 z-40' : ''
        }`}>
          <nav className="py-4">
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">主要功能</h3>
              <ul className="space-y-1">
                <li>
                  <Link 
                    to="/admin-home" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'dashboard' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('dashboard')}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-green-600 rounded-r-lg ${
                      activeNavItem === 'carousel' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('carousel')}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'news' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('news')}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'achievements' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('achievements')}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'knowledge' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('knowledge')}
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'users' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => handleNavItemClick('users')}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                
                <li>
                  <Link 
                    to="/login" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg ${
                      activeNavItem === 'logout' ? styles.sidebarItemActive : ''
                    }`}
                    onClick={(e) => {
                      handleNavItemClick('logout');
                      handleLogout(e);
                    }}
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
          className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg z-50"
          onClick={handleMobileMenuToggle}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        
        {/* 主内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* 页面标题 */}
          <div className={`mb-6 ${styles.fadeIn}`}>
            <h2 className="text-2xl font-bold text-text-primary">轮播图管理</h2>
            <p className="text-text-muted mt-1">管理网站首页展示的轮播图内容</p>
          </div>
          
          {/* 搜索、过滤和添加按钮 */}
          <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 ${styles.fadeInDelay1}`}>
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="搜索轮播图..." 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
              </div>
              
              <select 
                value={statusFilter === undefined ? 'all' : statusFilter.toString()}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? undefined : e.target.value === 'true')}
                className={`w-48 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 ${styles.customSelect}`}
              >
                <option value="all">全部状态</option>
                <option value="true">启用</option>
                <option value="false">禁用</option>
              </select>
            </div>
            
            <button 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
              onClick={handleAddBanner}
              disabled={isLoading}
            >
              <i className="fas fa-plus mr-2"></i>
              <span>添加轮播图</span>
            </button>
          </div>
          
          {/* 轮播图列表 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-4 md:p-6 mb-6 ${styles.fadeInDelay2}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">图片</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">文字内容</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">跳转链接</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">排序</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">状态</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-text-primary">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-2"></div>
                          加载中...
                        </div>
                      </td>
                    </tr>
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-muted">
                        {searchKeyword || statusFilter !== undefined ? '没有找到符合条件的轮播图' : '暂无轮播图数据'}
                      </td>
                    </tr>
                  ) : (
                    banners.map((banner, index) => (
                      <tr 
                        key={banner.id} 
                        className={`${index < banners.length - 1 ? 'border-b border-border-light' : ''} ${styles.tableRowHover}`}
                      >
                        <td className="py-4 px-4 text-sm text-text-primary">
                          <div className="flex items-center">
                            <img 
                              src={banner.image_url} 
                              alt="轮播图" 
                              className="w-16 h-10 object-cover rounded mr-3"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/160x100?text=图片加载失败';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-text-primary max-w-xs">
                          <div className="truncate" title={banner.text_content}>
                            {banner.text_content || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <a 
                            href={banner.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline max-w-xs truncate inline-block"
                            title={banner.link_url}
                          >
                            {banner.link_url || '-'}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-sm text-text-primary">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {banner.display_order}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <span 
                            className={`px-2 py-1 rounded text-xs cursor-pointer ${
                              banner.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                            onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                            title="点击切换状态"
                          >
                            {BANNER_STATUS_MAP[banner.is_active]}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={() => handleEditBanner(banner)}
                              title="编辑"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 transition-colors"
                              onClick={() => handleDeleteBanner(banner.id)}
                              title="删除"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 分页控件 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-text-muted">
                显示 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalBanners)} 条，共 {totalBanners} 条
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button 
                    className={`${styles.paginationItem} ${currentPage === 1 ? styles.paginationItemDisabled : ''} w-8 h-8 flex items-center justify-center rounded text-text-muted`}
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, start + 4);
                      pageNum = start + i;
                      if (pageNum > end) return null;
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        className={`${styles.paginationItem} ${currentPage === pageNum ? styles.paginationItemActive : ''} w-8 h-8 flex items-center justify-center rounded`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    className={`${styles.paginationItem} ${currentPage >= totalPages ? styles.paginationItemDisabled : ''} w-8 h-8 flex items-center justify-center rounded text-text-primary`}
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage >= totalPages}
                  >
                    <i className="fas fa-chevron-right text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* 添加/编辑轮播图模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary">
                  {editingBanner ? '编辑轮播图' : '添加轮播图'}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    轮播图片 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-32 h-20 border-2 border-dashed border-border-light rounded-lg flex items-center justify-center cursor-pointer hover:border-green-600 transition-colors"
                      onClick={() => document.getElementById('banner-image-input')?.click()}
                    >
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="预览" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <i className="fas fa-image text-2xl text-text-muted mb-1"></i>
                          <p className="text-xs text-text-muted">点击上传图片</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <input 
                        type="file" 
                        id="banner-image-input"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {selectedFile && (
                        <p className="text-sm text-text-primary">
                          已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                        </p>
                      )}
                      {!selectedFile && editingBanner && (
                        <p className="text-sm text-text-muted">
                          当前使用: {editingBanner.image_url.split('/').pop()}
                        </p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        支持 JPG、PNG、GIF、WebP 格式，最大 10MB
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 文字内容 */}
                <div>
                  <label htmlFor="text-content" className="block text-sm font-medium text-text-secondary mb-2">
                    文字内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="text-content"
                    value={formData.text_content}
                    onChange={(e) => handleFormFieldChange('text_content', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 resize-none"
                    placeholder="请输入轮播图显示的文字内容"
                  />
                </div>
                
                {/* 跳转链接 */}
                <div>
                  <label htmlFor="link-url" className="block text-sm font-medium text-text-secondary mb-2">
                    跳转链接 <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url" 
                    id="link-url"
                    value={formData.link_url}
                    onChange={(e) => handleFormFieldChange('link_url', e.target.value)}
                    className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                    placeholder="https://example.com"
                  />
                </div>
                
                {/* 显示顺序和状态 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="display-order" className="block text-sm font-medium text-text-secondary mb-2">
                      显示顺序 <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      id="display-order"
                      min="1"
                      max="10"
                      value={formData.display_order}
                      onChange={(e) => handleFormFieldChange('display_order', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      数字越小优先级越高（1-10）
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      状态
                    </label>
                    <div className="flex items-center space-x-4 mt-3">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="is_active" 
                          checked={formData.is_active === true}
                          onChange={() => handleFormFieldChange('is_active', true)}
                          className="mr-2"
                        />
                        <span className="text-sm text-text-primary">启用</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="is_active" 
                          checked={formData.is_active === false}
                          onChange={() => handleFormFieldChange('is_active', false)}
                          className="mr-2"
                        />
                        <span className="text-sm text-text-primary">禁用</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* 按钮组 */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-border-light">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-border-light rounded-lg text-text-secondary hover:bg-bg-gray transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingBanner ? '更新中...' : '保存中...'}
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {editingBanner ? '更新' : '保存'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarouselManagement;

