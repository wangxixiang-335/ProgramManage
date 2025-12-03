import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 新闻分类表接口
export interface NewsCategory {
  id: string;
  name: string;
  created_at: string;
}

// 新闻表接口
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category_id: string;
  is_top: boolean;
  is_pinned: boolean;
  published_at: string;
  image_url: string;
}

// 新闻表单数据接口
export interface NewsFormData {
  title: string;
  content: string;
  category_id: string;
  image_url?: string;
  is_top?: boolean;
  is_pinned?: boolean;
}

console.log('Supabase client initialized:', supabaseUrl);