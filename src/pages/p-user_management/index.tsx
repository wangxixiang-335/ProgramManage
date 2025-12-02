

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { 
  buildOrganizationTree, 
  getUsers, 
  getClasses, 
  OrgTreeNode, 
  User,
  getRoleName,
  getRoleStyleClass,
  getUserIconClass
} from '../../services/supabaseUserService';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [pageSize, setPageSize] = useState(5); // 每页显示5个
  const [currentPage, setCurrentPage] = useState(1);

  // 组织架构数据
  const [organizationTree, setOrganizationTree] = useState<OrgTreeNode[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [orgTree, users, classData] = await Promise.all([
        buildOrganizationTree(),
        getUsers(),
        getClasses()
      ]);
      
      setOrganizationTree(orgTree);
      setUsersList(users);
      setClasses(classData);
    } catch (err) {
      console.error('获取数据失败:', err);
      setError('获取数据失败，请检查数据库连接');
    } finally {
      setLoading(false);
    }
  };

  // 设置页面标题和初始化加载数据
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '软院项目通 - 用户管理';
    
    // 获取数据
    fetchData();
    
    return () => { document.title = originalTitle; };
  }, []);

  // 移动端菜单切换
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 树节点展开/收起
  const handleTreeNodeToggle = (nodeId: string, nodes: OrgTreeNode[] = organizationTree): OrgTreeNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: handleTreeNodeToggle(nodeId, node.children) };
      }
      return node;
    });
  };

  // 展开全部
  const handleExpandAll = () => {
    const expandAllNodes = (nodes: OrgTreeNode[]): OrgTreeNode[] => {
      return nodes.map(node => ({
        ...node,
        isOpen: true,
        children: node.children ? expandAllNodes(node.children) : undefined
      }));
    };
    setOrganizationTree(expandAllNodes(organizationTree));
  };

  // 收起全部
  const handleCollapseAll = () => {
    const collapseAllNodes = (nodes: OrgTreeNode[]): OrgTreeNode[] => {
      return nodes.map(node => ({
        ...node,
        isOpen: false,
        children: node.children ? collapseAllNodes(node.children) : undefined
      }));
    };
    setOrganizationTree(collapseAllNodes(organizationTree));
  };

  // 渲染树节点
  const renderTreeNode = (node: OrgTreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className={`${styles.treeNode} p-2 rounded-lg cursor-pointer`}>
        <div className="flex items-center">
          {hasChildren && (
            <i 
              className={`fas fa-chevron-right ${styles.treeToggle} ${node.isOpen ? styles.open : ''} w-4 h-4 text-text-muted mr-2`}
              onClick={(e) => {
                e.stopPropagation();
                setOrganizationTree(prev => handleTreeNodeToggle(node.id, prev));
              }}
            ></i>
          )}
          {!hasChildren && <div className="w-6"></div>}
          <i className={`${node.icon} ${node.iconColor} mr-2`}></i>
          <span className="font-medium">{node.name}</span>

        </div>
        {hasChildren && node.isOpen && (
          <div className={`${styles.treeChildren} ml-6 mt-2 space-y-2`}>
            {node.children!.map(childNode => renderTreeNode(childNode, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 获取班级名称
  const getClassName = (classId: string): string => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : '-';
  };

  // 获取用户状态（示例：基于创建时间判断是否活跃）
  const getUserStatus = (user: User): 'active' | 'inactive' => {
    // 这里可以根据实际业务逻辑判断用户状态
    // 目前简单返回活跃状态
    return 'active';
  };

  // 对用户列表进行排序：管理员(3) → 教师(2) → 学生(1)
  const sortedUsersList = [...usersList].sort((a, b) => {
    // 按role降序排列（3 > 2 > 1）
    return b.role - a.role;
  });

  // 分页计算变量

  // 计算分页数据
  const totalItems = sortedUsersList.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = sortedUsersList.slice(startIndex, endIndex);

  // 退出登录
  const handleLogout = (e: React.MouseEvent) => {
    if (!confirm('确定要退出登录吗？')) {
      e.preventDefault();
    }
  };

  // 操作按钮处理
  const handleCreateClass = () => {
    console.log('创建班级');
  };

  const handleAddUser = () => {
    console.log('添加用户');
  };

  const handleImportUsers = () => {
    console.log('导入用户');
  };

  const handleExportUsers = () => {
    console.log('导出用户');
  };

  const handleUserProfileClick = () => {
    console.log('打开用户菜单');
  };

  const handleNotificationClick = () => {
    console.log('打开通知面板');
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
                <p className="text-sm font-medium text-text-primary">管理员</p>
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
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                  >
                    <i className="fas fa-tachometer-alt w-5 text-center mr-3"></i>
                    <span>控制台</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/carousel-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                  >
                    <i className="fas fa-images w-5 text-center mr-3"></i>
                    <span>轮播图管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                  >
                    <i className="fas fa-newspaper w-5 text-center mr-3"></i>
                    <span>新闻管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievement-library-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                  >
                    <i className="fas fa-award w-5 text-center mr-3"></i>
                    <span>成果库管理</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/knowledge-base-management" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
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
                    className={`${styles.sidebarItem} ${styles.active} flex items-center px-4 py-3 text-green-600 rounded-r-lg`}
                  >
                    <i className="fas fa-users w-5 text-center mr-3"></i>
                    <span>用户管理</span>
                  </Link>
                </li>
                <li>
                  <button className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg w-full text-left`}>
                    <i className="fas fa-cog w-5 text-center mr-3"></i>
                    <span>系统设置</span>
                  </button>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className={`${styles.sidebarItem} flex items-center px-4 py-3 text-text-secondary hover:text-green-600 rounded-r-lg`}
                    onClick={handleLogout}
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
            <h2 className="text-2xl font-bold text-text-primary">用户管理</h2>
            <p className="text-text-muted mt-1">管理用户权限和组织架构</p>
          </div>
          
          {/* 操作按钮区域 */}
          <div className={`flex flex-wrap gap-3 mb-6 ${styles.fadeIn}`} style={{animationDelay: '0.1s'}}>
            <button 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleCreateClass}
            >
              <i className="fas fa-plus mr-2"></i>
              <span>创建班级</span>
            </button>
            <button 
              className="flex items-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              onClick={handleAddUser}
            >
              <i className="fas fa-user-plus mr-2"></i>
              <span>添加用户</span>
            </button>
            <button 
              className="flex items-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              onClick={handleImportUsers}
            >
              <i className="fas fa-file-import mr-2"></i>
              <span>导入用户</span>
            </button>
            <button 
              className="flex items-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              onClick={handleExportUsers}
            >
              <i className="fas fa-file-export mr-2"></i>
              <span>导出用户</span>
            </button>
          </div>
          
          {/* 搜索和筛选区域 */}
          <div className={`bg-bg-light rounded-xl shadow-card p-4 mb-6 ${styles.fadeIn}`} style={{animationDelay: '0.2s'}}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索用户姓名、学号或邮箱..." 
                    className="w-full px-4 py-2 pl-10 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
                </div>
              </div>
              <div className="flex gap-3">
                <select 
                  className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">所有角色</option>
                  <option value="admin">管理员</option>
                  <option value="teacher">教师</option>
                  <option value="student">学生</option>
                </select>
                <select 
                  className="px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="">所有班级</option>
                  <option value="class1">软件工程1班</option>
                  <option value="class2">软件工程2班</option>
                  <option value="class3">计算机科学1班</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 组织架构和用户列表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 组织架构树状图 */}
            <div className={`lg:col-span-1 bg-bg-light rounded-xl shadow-card p-5 ${styles.fadeIn}`} style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">组织架构</h3>
                <div className="flex gap-2">
                  <button 
                    className="text-sm text-green-600 hover:text-green-700"
                    onClick={handleExpandAll}
                  >
                    <i className="fas fa-expand-alt mr-1"></i>展开全部
                  </button>
                  <button 
                    className="text-sm text-green-600 hover:text-green-700"
                    onClick={handleCollapseAll}
                  >
                    <i className="fas fa-compress-alt mr-1"></i>收起全部
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <i className="fas fa-spinner fa-spin text-green-600 mr-2"></i>
                    <span className="text-text-muted">加载组织架构中...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <i className="fas fa-exclamation-triangle text-red-500 mb-2"></i>
                    <p className="text-red-600">{error}</p>
                    <button 
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={fetchData}
                    >
                      重新加载
                    </button>
                  </div>
                ) : organizationTree.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-gray-400 mb-2"></i>
                    <p className="text-text-muted">暂无组织架构数据</p>
                  </div>
                ) : (
                  organizationTree.map(node => renderTreeNode(node))
                )}
              </div>
            </div>
            
            {/* 用户列表 */}
            <div className={`lg:col-span-2 bg-bg-light rounded-xl shadow-card p-5 ${styles.fadeIn}`} style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">用户列表</h3>
                <div className="text-sm text-text-muted">
                  每页显示 {pageSize} 条
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`${styles.userTable} w-full min-w-[600px]`}>
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">姓名</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">角色</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">班级</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">邮箱</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">状态</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(user => (
                      <tr key={user.id} className="border-t border-border-light">
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 ${getUserIconClass(user.role).split(' ').slice(0, 3).join(' ')} rounded-full flex items-center justify-center mb-1`}>
                              <i className={getUserIconClass(user.role).split(' ')[0]}></i>
                            </div>
                            <span className="text-center text-sm font-medium">{user.full_name || user.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={getRoleStyleClass(user.role)}>
                            {getRoleName(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getClassName(user.class_id || '')}
                        </td>
                        <td className="px-4 py-3 text-center">{user.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`flex items-center justify-center ${getUserStatus(user) === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                            <i className="fas fa-circle text-xs mr-1"></i>
                            {getUserStatus(user) === 'active' ? '活跃' : '未激活'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button className="text-green-600 hover:text-green-700" title="编辑">
                              <i className="fas fa-edit"></i>
                            </button>
                            {user.role === 2 && (
                              <button className="text-green-600 hover:text-green-700" title="管理班级">
                                <i className="fas fa-users-cog"></i>
                              </button>
                            )}
                            {user.role === 1 && (
                              <button className="text-green-600 hover:text-green-700" title="调整班级">
                                <i className="fas fa-exchange-alt"></i>
                              </button>
                            )}
                            <button className="text-gray-500 hover:text-gray-700" title="重置密码">
                              <i className="fas fa-key"></i>
                            </button>
                            <button className="text-gray-500 hover:text-gray-700" title="查看详情">
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-text-muted">
                  显示 {startIndex + 1} 至 {Math.min(endIndex, totalItems)} 条，共 {totalItems} 条
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-muted hover:border-green-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left text-xs"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button 
                      key={pageNum}
                      className={`w-8 h-8 flex items-center justify-center rounded border ${
                        currentPage === pageNum 
                          ? 'border-green-600 bg-green-600 text-white' 
                          : 'border-border-light text-text-primary hover:border-green-600 hover:text-green-600'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-border-light text-text-muted hover:border-green-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
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

export default UserManagement;

