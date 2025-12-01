export interface User {
  id: number;
  username: string;
  email: string;
  role: number; // 1: 学生, 2: 教师, 3: 管理员
  created_at?: string;
  updated_at?: string;
  student_id?: string;
  work_number?: string;
  department?: string;
  phone?: string;
  name?: string;
}

export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
  }
  return null;
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
};

export const getUserDisplayName = (user?: User): string => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return '未知用户';
  
  if (currentUser.role === 1 && currentUser.student_id) {
    return currentUser.student_id;
  } else if (currentUser.role === 2 && currentUser.work_number) {
    return currentUser.work_number;
  } else if (currentUser.name) {
    return currentUser.name;
  }
  
  return '未知用户';
};

export const getUserDepartment = (user?: User): string => {
  const currentUser = user || getCurrentUser();
  return currentUser?.department || '';
};

export const isStudent = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return currentUser?.role === 1;
};

export const isTeacher = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return currentUser?.role === 2;
};

export const isAdmin = (user?: User): boolean => {
  const currentUser = user || getCurrentUser();
  return currentUser?.role === 3;
};

export const getUserRoleText = (user?: User): string => {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return '未知角色';
  
  switch (currentUser.role) {
    case 1:
      return '学生';
    case 2:
      return '教师';
    case 3:
      return '管理员';
    default:
      return '未知角色';
  }
};