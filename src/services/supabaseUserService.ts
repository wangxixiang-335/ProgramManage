import { supabase } from '../lib/supabase';

// 用户表接口
export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: number; // 1: student, 2: teacher, 3: admin
  class_id?: string; // 外键，关联到classes表
  created_at: string;
  updated_at: string;
}

// 年级表接口
export interface Grade {
  id: string;
  name: string;
  created_at: string;
}

// 班级表接口
export interface Class {
  id: string;
  name: string;
  grade_id: string; // 外键，关联到grades表
  instructor_id?: string;
  created_at: string;
}

// 组织架构节点接口
export interface OrgTreeNode {
  id: string;
  name: string;
  type: 'root' | 'admin' | 'teacher' | 'grade' | 'class' | 'student';
  icon: string;
  iconColor: string;
  isOpen?: boolean;
  children?: OrgTreeNode[];
  userId?: string;
  gradeId?: string;
  classId?: string;
}

// 获取所有年级
export const getGrades = async (): Promise<Grade[]> => {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .order('name', { ascending: false });

    if (error) {
      console.error('获取年级列表失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取年级列表异常:', error);
    throw error;
  }
};

// 获取所有班级
export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('获取班级列表失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取班级列表异常:', error);
    throw error;
  }
};

// 获取所有用户
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取用户列表异常:', error);
    throw error;
  }
};

// 获取指定班级的学生
export const getStudentsByClass = async (classId: string): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 1) // 学生
      .eq('class_id', classId)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('获取班级学生失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取班级学生异常:', error);
    throw error;
  }
};

// 获取指定年级的班级
export const getClassesByGrade = async (gradeId: string): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('grade_id', gradeId)
      .order('name', { ascending: true });

    if (error) {
      console.error('获取年级班级失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取年级班级异常:', error);
    throw error;
  }
};

// 构建组织架构树
export const buildOrganizationTree = async (): Promise<OrgTreeNode[]> => {
  try {
    // 并行获取所有数据
    const [grades, classes, users] = await Promise.all([
      getGrades(),
      getClasses(), 
      getUsers()
    ]);

    // 按角色分类用户
    const adminUsers = users.filter(user => user.role === 3);
    const teacherUsers = users.filter(user => user.role === 2);
    const studentUsers = users.filter(user => user.role === 1);

    // 构建管理员子节点
    const adminChildren: OrgTreeNode[] = adminUsers.map(user => ({
      id: `admin-${user.id}`,
      name: user.full_name || user.username,
      type: 'admin',
      icon: 'fas fa-user',
      iconColor: 'text-red-400',
      userId: user.id
    }));

    // 构建教师子节点
    const teacherChildren: OrgTreeNode[] = teacherUsers.map(user => ({
      id: `teacher-${user.id}`,
      name: user.full_name || user.username,
      type: 'teacher',
      icon: 'fas fa-user',
      iconColor: 'text-blue-400',
      userId: user.id
    }));

    // 构建年级和班级学生节点
    const gradeChildren: OrgTreeNode[] = grades.map(grade => {
      // 获取该年级的班级
      const gradeClasses = classes.filter(cls => cls.grade_id === grade.id);
      
      const classChildren = gradeClasses.map(cls => {
        // 获取该班级的学生
        const classStudents = studentUsers.filter(student => student.class_id === cls.id);
        
        const studentChildren = classStudents.map(student => ({
          id: `student-${student.id}`,
          name: student.full_name || student.username,
          type: 'student',
          icon: 'fas fa-user',
          iconColor: 'text-green-400',
          userId: student.id
        }));

        return {
          id: `class-${cls.id}`,
          name: cls.name,
          type: 'class',
          icon: 'fas fa-graduation-cap',
          iconColor: 'text-green-500',
          isOpen: false,
          children: studentChildren,
          classId: cls.id
        };
      });

      return {
        id: `grade-${grade.id}`,
        name: grade.name,
        type: 'grade',
        icon: 'fas fa-layer-group',
        iconColor: 'text-purple-500',
        isOpen: false,
        children: classChildren,
        gradeId: grade.id
      };
    });

    // 构建完整的组织架构树
    const organizationTree: OrgTreeNode[] = [
      {
        id: 'root',
        name: '软件学院',
        type: 'root',
        icon: 'fas fa-university',
        iconColor: 'text-secondary',
        isOpen: false,
        children: [
          {
            id: 'admin-group',
            name: '管理员',
            type: 'admin',
            icon: 'fas fa-user-shield',
            iconColor: 'text-red-500',
            isOpen: false,
            children: adminChildren
          },
          {
            id: 'teacher-group',
            name: '教师',
            type: 'teacher',
            icon: 'fas fa-chalkboard-teacher',
            iconColor: 'text-blue-500',
            isOpen: false,
            children: teacherChildren
          },
          ...gradeChildren
        ]
      }
    ];

    return organizationTree;
  } catch (error) {
    console.error('构建组织架构树失败:', error);
    throw error;
  }
};

// 获取角色名称
export const getRoleName = (role: number): string => {
  switch (role) {
    case 3:
      return '管理员';
    case 2:
      return '教师';
    case 1:
      return '学生';
    default:
      return '未知';
  }
};

// 获取角色样式类名
export const getRoleStyleClass = (role: number): string => {
  switch (role) {
    case 3:
      return 'px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full';
    case 2:
      return 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full';
    case 1:
      return 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full';
    default:
      return 'px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full';
  }
};

// 获取用户图标类名
export const getUserIconClass = (role: number): string => {
  switch (role) {
    case 3:
      return 'fas fa-user-shield text-red-500 bg-red-100';
    case 2:
      return 'fas fa-chalkboard-teacher text-blue-500 bg-blue-100';
    case 1:
      return 'fas fa-user-graduate text-green-500 bg-green-100';
    default:
      return 'fas fa-user text-gray-500 bg-gray-100';
  }
};

// 切换教师班级
export const switchTeacherClass = async (teacherId: string, newClassId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ class_id: newClassId, updated_at: new Date().toISOString() })
      .eq('id', teacherId);

    if (error) {
      console.error('切换教师班级失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('切换教师班级异常:', error);
    throw error;
  }
};

// 获取未分配班级的教师
export const getUnassignedTeachers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 2) // 教师
      .is('class_id', null) // 未分配班级
      .order('full_name', { ascending: true });

    if (error) {
      console.error('获取未分配班级教师失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取未分配班级教师异常:', error);
    throw error;
  }
};

// 获取未分配班级的学生
export const getUnassignedStudents = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 1) // 学生
      .is('class_id', null) // 未分配班级
      .order('full_name', { ascending: true });

    if (error) {
      console.error('获取未分配班级学生失败:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取未分配班级学生异常:', error);
    throw error;
  }
};

// 添加学生到班级
export const addStudentToClass = async (studentId: string, classId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ class_id: classId, updated_at: new Date().toISOString() })
      .eq('id', studentId);

    if (error) {
      console.error('添加学生到班级失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('添加学生到班级异常:', error);
    throw error;
  }
};

// 批量添加学生到班级
export const addStudentsToClass = async (studentIds: string[], classId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ class_id: classId, updated_at: new Date().toISOString() })
      .in('id', studentIds);

    if (error) {
      console.error('批量添加学生到班级失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('批量添加学生到班级异常:', error);
    throw error;
  }
};

// 切换学生班级
export const switchStudentClass = async (studentId: string, newClassId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ class_id: newClassId, updated_at: new Date().toISOString() })
      .eq('id', studentId);

    if (error) {
      console.error('切换学生班级失败:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('切换学生班级异常:', error);
    throw error;
  }
};

// 获取所有班级（用于切换选择）
export const getAllClassesForSwitch = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        grades!inner (name)
      `)
      .order('grade_id', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('获取所有班级失败:', error);
      throw error;
    }

    console.log('获取到的班级数据:', data);
    return data || [];
  } catch (error) {
    console.error('获取所有班级异常:', error);
    throw error;
  }
};

// 备选方案：分别获取班级和年级数据
export const getAllClassesForSwitchFallback = async (): Promise<any[]> => {
  try {
    // 分别获取班级和年级数据
    const [classesResult, gradesResult] = await Promise.all([
      supabase
        .from('classes')
        .select('*')
        .order('grade_id', { ascending: false })
        .order('name', { ascending: true }),
      supabase
        .from('grades')
        .select('id, name')
        .order('name', { ascending: false })
    ]);

    if (classesResult.error) {
      console.error('获取班级失败:', classesResult.error);
      throw classesResult.error;
    }

    if (gradesResult.error) {
      console.error('获取年级失败:', gradesResult.error);
      throw gradesResult.error;
    }

    // 手动合并数据
    const grades = gradesResult.data || [];
    const classes = classesResult.data || [];
    
    const classesWithGrades = classes.map(cls => {
      const grade = grades.find(g => g.id === cls.grade_id);
      return {
        ...cls,
        grades: grade
      };
    });

    console.log('备选方案获取的班级数据:', classesWithGrades);
    return classesWithGrades;
  } catch (error) {
    console.error('备选方案获取班级异常:', error);
    throw error;
  }
};