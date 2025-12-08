export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: number;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = 1 | 2 | 3; // 1: student, 2: teacher, 3: admin

export type RoleType = 'student' | 'teacher' | 'admin';