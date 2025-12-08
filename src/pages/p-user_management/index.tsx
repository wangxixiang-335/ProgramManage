

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';
import { 
  buildOrganizationTree, 
  getUsers, 
  getClasses, 
  getUnassignedStudents,
  addStudentsToClass,
  switchStudentClass,
  switchTeacherClass,
  getAllClassesForSwitch,
  getAllClassesForSwitchFallback,
  createClass,
  addUser,
  searchUsers,
  getGrades,
  OrgTreeNode, 
  User,
  getRoleName,
  getRoleStyleClass,
  getUserIconClass
} from '../../services/supabaseUserService';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    
    // 调试用户登录状态
    console.log('用户管理页面 - 用户登录状态:', user);
    console.log('用户详细信息:', {
      id: user?.id,
      username: user?.username,
      full_name: user?.full_name,
      email: user?.email,
      role: user?.role
    });
    
    // 获取数据
    fetchData();
    
    return () => { document.title = originalTitle; };
  }, [user]);

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
          <span 
            className={`font-medium flex-1 ${(node.type === 'student' || node.type === 'teacher') ? 'cursor-pointer hover:text-green-600' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if ((node.type === 'student' || node.type === 'teacher') && node.userId) {
                // 找到对应的用户数据
                const user = usersList.find(u => u.id === node.userId);
                if (user) {
                  if (node.type === 'student') {
                    handleOpenSwitchClassModal(user);
                  } else if (node.type === 'teacher') {
                    handleOpenSwitchTeacherClassModal(user);
                  }
                }
              }
            }}
            title={(node.type === 'student' || node.type === 'teacher') ? '点击切换班级' : ''}
          >
            {node.name}
          </span>
          
          {/* 为班级节点添加添加按钮 */}
          {node.type === 'class' && (
            <button 
              className="ml-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAddStudentModal(node.classId || '');
              }}
              title="添加学生到班级"
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          )}

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
  const displayUsersList = searchKeyword || roleFilter || classFilter ? searchUsersList : sortedUsersList;
  const totalItems = displayUsersList.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = displayUsersList.slice(startIndex, endIndex);

  // 添加学生相关状态
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // 学生班级切换相关状态
  const [showSwitchClassModal, setShowSwitchClassModal] = useState(false);
  const [selectedStudentForSwitch, setSelectedStudentForSwitch] = useState<User | null>(null);
  const [allClassesForSwitch, setAllClassesForSwitch] = useState<any[]>([]);
  const [selectedNewClassId, setSelectedNewClassId] = useState<string>('');
  const [loadingClassesForSwitch, setLoadingClassesForSwitch] = useState(false);

  // 教师班级切换相关状态
  const [showSwitchTeacherModal, setShowSwitchTeacherModal] = useState(false);
  const [selectedTeacherForSwitch, setSelectedTeacherForSwitch] = useState<User | null>(null);
  const [allClassesForTeacher, setAllClassesForTeacher] = useState<any[]>([]);
  const [selectedTeacherNewClassId, setSelectedTeacherNewClassId] = useState<string>('');
  const [loadingClassesForTeacher, setLoadingClassesForTeacher] = useState(false);

  // 创建班级相关状态
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedGradeForClass, setSelectedGradeForClass] = useState('');
  const [selectedInstructorForClass, setSelectedInstructorForClass] = useState('');
  const [loadingCreateClass, setLoadingCreateClass] = useState(false);
  const [gradesForCreateClass, setGradesForCreateClass] = useState<any[]>([]);
  const [teachersForInstructor, setTeachersForInstructor] = useState<any[]>([]);

  // 添加用户相关状态
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 1, // 默认学生
    class_id: ''
  });
  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [classesForUser, setClassesForUser] = useState<any[]>([]);

  // 搜索相关状态
  const [searchUsersList, setSearchUsersList] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // 初始化搜索数据
  useEffect(() => {
    handleSearchUsers(searchKeyword, roleFilter ? parseInt(roleFilter) : undefined, classFilter || undefined);
  }, [searchKeyword, roleFilter, classFilter]);

  // 退出登录
  const handleLogout = (e: React.MouseEvent) => {
    if (!confirm('确定要退出登录吗？')) {
      e.preventDefault();
    }
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



  // 打开添加学生弹窗
  const handleOpenAddStudentModal = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudentIds([]);
    setShowAddStudentModal(true);
    
    try {
      setLoadingStudents(true);
      const students = await getUnassignedStudents();
      setAvailableStudents(students);
    } catch (error) {
      console.error('获取未分配学生失败:', error);
      alert('获取未分配学生失败，请稍后重试');
    } finally {
      setLoadingStudents(false);
    }
  };

  // 关闭添加学生弹窗
  const handleCloseAddStudentModal = () => {
    setShowAddStudentModal(false);
    setSelectedClassId('');
    setSelectedStudentIds([]);
    setAvailableStudents([]);
  };

  // 处理学生选择
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 添加选中的学生到班级
  const handleAddStudentsToClass = async () => {
    if (selectedStudentIds.length === 0) {
      alert('请选择要添加的学生');
      return;
    }

    try {
      const success = await addStudentsToClass(selectedStudentIds, selectedClassId);
      if (success) {
        alert(`成功添加 ${selectedStudentIds.length} 名学生到班级`);
        handleCloseAddStudentModal();
        // 刷新数据
        fetchData();
      }
    } catch (error) {
      console.error('添加学生失败:', error);
      alert('添加学生失败，请稍后重试');
    }
  };

  // 打开班级切换弹窗
  const handleOpenSwitchClassModal = async (student: User) => {
    setSelectedStudentForSwitch(student);
    setSelectedNewClassId(student.class_id || '');
    setShowSwitchClassModal(true);
    
    try {
      setLoadingClassesForSwitch(true);
      let classes;
      
      // 先尝试主要方法
      try {
        classes = await getAllClassesForSwitch();
      } catch (mainError) {
        console.warn('主要方法失败，使用备选方案:', mainError);
        // 如果主要方法失败，使用备选方案
        classes = await getAllClassesForSwitchFallback();
      }
      
      setAllClassesForSwitch(classes);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      alert('获取班级列表失败，请稍后重试');
    } finally {
      setLoadingClassesForSwitch(false);
    }
  };

  // 关闭班级切换弹窗
  const handleCloseSwitchClassModal = () => {
    setShowSwitchClassModal(false);
    setSelectedStudentForSwitch(null);
    setSelectedNewClassId('');
    setAllClassesForSwitch([]);
  };

  // 切换学生班级
  const handleSwitchStudentClass = async () => {
    if (!selectedStudentForSwitch || !selectedNewClassId) {
      alert('请选择新的班级');
      return;
    }

    if (selectedNewClassId === selectedStudentForSwitch.class_id) {
      alert('新班级不能与当前班级相同');
      return;
    }

    try {
      const success = await switchStudentClass(selectedStudentForSwitch.id, selectedNewClassId);
      if (success) {
        const newClass = allClassesForSwitch.find(c => c.id === selectedNewClassId);
        const studentName = selectedStudentForSwitch.full_name || selectedStudentForSwitch.username;
        alert(`成功将 ${studentName} 切换到 ${newClass?.name}`);
        handleCloseSwitchClassModal();
        // 刷新数据
        fetchData();
      }
    } catch (error) {
      console.error('切换班级失败:', error);
      alert('切换班级失败，请稍后重试');
    }
  };

  // 打开教师班级切换弹窗
  const handleOpenSwitchTeacherClassModal = async (teacher: User) => {
    setSelectedTeacherForSwitch(teacher);
    setSelectedTeacherNewClassId(teacher.class_id || '');
    setShowSwitchTeacherModal(true);
    
    try {
      setLoadingClassesForTeacher(true);
      let classes;
      
      // 先尝试主要方法
      try {
        classes = await getAllClassesForSwitch();
      } catch (mainError) {
        console.warn('主要方法失败，使用备选方案:', mainError);
        // 如果主要方法失败，使用备选方案
        classes = await getAllClassesForSwitchFallback();
      }
      
      setAllClassesForTeacher(classes);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      alert('获取班级列表失败，请稍后重试');
    } finally {
      setLoadingClassesForTeacher(false);
    }
  };

  // 关闭教师班级切换弹窗
  const handleCloseSwitchTeacherModal = () => {
    setShowSwitchTeacherModal(false);
    setSelectedTeacherForSwitch(null);
    setSelectedTeacherNewClassId('');
    setAllClassesForTeacher([]);
  };

  // 切换教师班级
  const handleSwitchTeacherClass = async () => {
    if (!selectedTeacherForSwitch || !selectedTeacherNewClassId) {
      alert('请选择新的班级');
      return;
    }

    if (selectedTeacherNewClassId === selectedTeacherForSwitch.class_id) {
      alert('新班级不能与当前班级相同');
      return;
    }

    try {
      const success = await switchTeacherClass(selectedTeacherForSwitch.id, selectedTeacherNewClassId);
      if (success) {
        const newClass = allClassesForTeacher.find(c => c.id === selectedTeacherNewClassId);
        const teacherName = selectedTeacherForSwitch.full_name || selectedTeacherForSwitch.username;
        alert(`成功将 ${teacherName} 切换到 ${newClass?.name}`);
        handleCloseSwitchTeacherModal();
        // 刷新数据
        fetchData();
      }
    } catch (error) {
      console.error('切换教师班级失败:', error);
      alert('切换班级失败，请稍后重试');
    }
  };

  // 打开创建班级弹窗
  const handleOpenCreateClassModal = async () => {
    try {
      setLoadingCreateClass(true);
      const [grades, teachers] = await Promise.all([
        getGrades(),
        getUsers().then(users => users.filter(u => u.role === 2)) // 获取教师
      ]);
      setGradesForCreateClass(grades);
      setTeachersForInstructor(teachers);
      setShowCreateClassModal(true);
    } catch (error) {
      console.error('获取年级和教师数据失败:', error);
      alert('获取数据失败，请稍后重试');
    } finally {
      setLoadingCreateClass(false);
    }
  };

  // 关闭创建班级弹窗
  const handleCloseCreateClassModal = () => {
    setShowCreateClassModal(false);
    setNewClassName('');
    setSelectedGradeForClass('');
    setSelectedInstructorForClass('');
  };

  // 创建班级
  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      alert('请输入班级名称');
      return;
    }

    if (!selectedGradeForClass) {
      alert('请选择年级');
      return;
    }

    try {
      const success = await createClass(
        newClassName.trim(),
        selectedGradeForClass,
        selectedInstructorForClass || undefined
      );
      
      if (success) {
        alert('班级创建成功');
        handleCloseCreateClassModal();
        fetchData(); // 刷新数据
      }
    } catch (error) {
      console.error('创建班级失败:', error);
      alert('创建班级失败，请稍后重试');
    }
  };

  // 打开添加用户弹窗
  const handleOpenAddUserModal = async () => {
    try {
      setLoadingAddUser(true);
      const [classList, teachers] = await Promise.all([
        getClasses(),
        getUsers().then(users => users.filter(u => u.role === 2)) // 获取教师
      ]);
      setClassesForUser(classList);
      setTeachersForInstructor(teachers);
      setShowAddUserModal(true);
    } catch (error) {
      console.error('获取班级和教师数据失败:', error);
      alert('获取数据失败，请稍后重试');
    } finally {
      setLoadingAddUser(false);
    }
  };

  // 关闭添加用户弹窗
  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    setNewUser({
      username: '',
      full_name: '',
      email: '',
      password: '',
      role: 1,
      class_id: ''
    });
  };

  // 添加用户
  const handleAddUser = async () => {
    if (!newUser.username.trim()) {
      alert('请输入用户名');
      return;
    }

    if (!newUser.full_name.trim()) {
      alert('请输入姓名');
      return;
    }

    if (!newUser.email.trim()) {
      alert('请输入邮箱');
      return;
    }

    if (!newUser.password) {
      alert('请输入密码');
      return;
    }

    try {
      const success = await addUser({
        username: newUser.username.trim(),
        full_name: newUser.full_name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
        class_id: newUser.class_id || undefined
      });
      
      if (success) {
        alert('用户添加成功');
        handleCloseAddUserModal();
        fetchData(); // 刷新数据
      }
    } catch (error) {
      console.error('添加用户失败:', error);
      alert('添加用户失败，请稍后重试');
    }
  };

  // 搜索用户
  const handleSearchUsers = async (keyword: string, role?: number, classId?: string) => {
    try {
      setLoadingSearch(true);
      const users = await searchUsers(keyword, role, classId);
      setSearchUsersList(users);
    } catch (error) {
      console.error('搜索用户失败:', error);
      alert('搜索失败，请稍后重试');
    } finally {
      setLoadingSearch(false);
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
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleUserProfileClick}
            >
              <div className="w-8 h-8 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center text-green-600">
                <i className="fas fa-user"></i>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user?.full_name || user?.username || '管理员'}</p>
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
                  className={`w-48 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 ${styles.customSelect}`}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">所有角色</option>
                  <option value="3">管理员</option>
                  <option value="2">教师</option>
                  <option value="1">学生</option>
                </select>
                <select 
                  className={`w-48 px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 ${styles.customSelect}`}
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="">所有班级</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
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
      
      {/* 添加学生弹窗 */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加学生到班级</h3>
              <button 
                onClick={handleCloseAddStudentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingStudents ? (
                <div className="flex justify-center items-center py-8">
                  <i className="fas fa-spinner fa-spin text-green-600 mr-2"></i>
                  <span>加载中...</span>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-user-graduate text-gray-400 mb-2"></i>
                  <p className="text-gray-500">暂无可添加的学生</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="flex items-center mb-4">
                    <input 
                      type="checkbox"
                      id="selectAll"
                      checked={selectedStudentIds.length === availableStudents.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds(availableStudents.map(s => s.id));
                        } else {
                          setSelectedStudentIds([]);
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium">
                      全选 ({selectedStudentIds.length}/{availableStudents.length})
                    </label>
                  </div>
                  
                  {availableStudents.map(student => (
                    <div key={student.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                      <input 
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{student.full_name || student.username}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                      <div className="text-green-600">
                        <i className="fas fa-user-graduate"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
              <button 
                onClick={handleCloseAddStudentModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleAddStudentsToClass}
                disabled={selectedStudentIds.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加选中的学生 ({selectedStudentIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 班级切换弹窗 */}
      {showSwitchClassModal && selectedStudentForSwitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">切换学生班级</h3>
              <button 
                onClick={handleCloseSwitchClassModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="bg-gray-50 p-3 rounded mb-4">
                <div className="font-medium text-gray-900">
                  {selectedStudentForSwitch.full_name || selectedStudentForSwitch.username}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedStudentForSwitch.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择新的班级
                </label>
                {loadingClassesForSwitch ? (
                  <div className="flex justify-center items-center py-4">
                    <i className="fas fa-spinner fa-spin text-green-600 mr-2"></i>
                    <span>加载班级列表中...</span>
                  </div>
                ) : (
                  <select 
                    value={selectedNewClassId}
                    onChange={(e) => setSelectedNewClassId(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.customSelect}`}
                  >
                    <option value="">请选择班级</option>
                    <option value="">无班级</option>
                    {allClassesForSwitch.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.grades?.name} - {cls.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCloseSwitchClassModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleSwitchStudentClass}
                disabled={!selectedNewClassId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 教师班级切换弹窗 */}
      {showSwitchTeacherModal && selectedTeacherForSwitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">切换教师班级</h3>
              <button 
                onClick={handleCloseSwitchTeacherModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="bg-blue-50 p-3 rounded mb-4">
                <div className="font-medium text-gray-900">
                  {selectedTeacherForSwitch.full_name || selectedTeacherForSwitch.username}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedTeacherForSwitch.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择新的班级
                </label>
                {loadingClassesForTeacher ? (
                  <div className="flex justify-center items-center py-4">
                    <i className="fas fa-spinner fa-spin text-green-600 mr-2"></i>
                    <span>加载班级列表中...</span>
                  </div>
                ) : (
                  <select 
                    value={selectedTeacherNewClassId}
                    onChange={(e) => setSelectedTeacherNewClassId(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.customSelect}`}
                  >
                    <option value="">请选择班级</option>
                    <option value="">无班级</option>
                    {allClassesForTeacher.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.grades?.name} - {cls.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCloseSwitchTeacherModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleSwitchTeacherClass}
                disabled={!selectedTeacherNewClassId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 创建班级弹窗 */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">创建班级</h3>
              <button 
                onClick={handleCloseCreateClassModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  班级名称
                </label>
                <input 
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入班级名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年级
                </label>
                <select 
                  value={selectedGradeForClass}
                  onChange={(e) => setSelectedGradeForClass(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.customSelect}`}
                >
                  <option value="">请选择年级</option>
                  {gradesForCreateClass.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  指导教师（可选）
                </label>
                <select 
                  value={selectedInstructorForClass}
                  onChange={(e) => setSelectedInstructorForClass(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${styles.customSelect}`}
                >
                  <option value="">请选择指导教师</option>
                  {teachersForInstructor.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name || teacher.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={handleCloseCreateClassModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleCreateClass}
                disabled={loadingCreateClass}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCreateClass ? '创建中...' : '创建班级'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加用户弹窗 */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">添加用户</h3>
              <button 
                onClick={handleCloseAddUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input 
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入用户名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <input 
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入真实姓名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input 
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入邮箱"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入密码"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={1}>学生</option>
                  <option value={2}>教师</option>
                  <option value={3}>管理员</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分配班级
                </label>
                <select 
                  value={newUser.class_id}
                  onChange={(e) => setNewUser({...newUser, class_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">请选择班级</option>
                  {classesForUser.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={handleCloseAddUserModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button 
                onClick={handleAddUser}
                disabled={loadingAddUser}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAddUser ? '添加中...' : '添加用户'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

