import { supabase } from './supabase';
import { User, RegisterData, LoginData } from '../types/user';

export class AuthService {
  // 注册新用户
  static async register(userData: RegisterData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // 检查邮箱是否已存在
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 表示没有找到记录，其他错误需要处理
        throw new Error(checkError.message);
      }

      if (existingUser) {
        return { success: false, message: '该邮箱已被注册' };
      }

      // 检查用户名是否已存在
      const { data: existingUsername, error: usernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', userData.username)
        .single();

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw new Error(usernameError.message);
      }

      if (existingUsername) {
        return { success: false, message: '该用户名已被使用' };
      }

      // 插入新用户
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: userData.username,
            email: userData.email,
            password_hash: userData.password, // 注意：这里应该加密密码，暂时直接存储
            role: userData.role
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { 
        success: true, 
        message: '注册成功',
        data: {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          full_name: data.full_name
        }
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '注册失败，请稍后再试' 
      };
    }
  }

  // 用户登录
  static async login(loginData: LoginData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // 根据邮箱查询用户
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', loginData.email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, message: '邮箱或密码错误' };
        }
        throw new Error(error.message);
      }

      // 验证密码（注意：这里应该解密密码哈希进行比对，暂时直接比较）
      if (data.password_hash !== loginData.password) {
        return { success: false, message: '邮箱或密码错误' };
      }

      // 登录成功，返回用户信息
      return { 
        success: true, 
        message: '登录成功',
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          password_hash: data.password_hash,
          role: data.role,
          full_name: data.full_name,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '登录失败，请稍后再试' 
      };
    }
  }

  // 获取角色名称
  static getRoleName(role: number): string {
    switch (role) {
      case 1:
        return 'student';
      case 2:
        return 'teacher';
      case 3:
        return 'admin';
      default:
        return 'student';
    }
  }

  // 根据角色名称获取角色ID
  static getRoleId(roleName: string): number {
    switch (roleName) {
      case 'teacher':
        return 2;
      case 'admin':
        return 3;
      case 'student':
      default:
        return 1;
    }
  }

  // 获取角色首页路由
  static getRoleHomeRoute(role: number): string {
    switch (role) {
      case 1:
        return '/home';
      case 2:
        return '/teacher-home';
      case 3:
        return '/admin-home';
      default:
        return '/home';
    }
  }
}

export default AuthService;