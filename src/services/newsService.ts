import { get, post, put, del } from './api';

// 新闻相关类型定义
export interface NewsCategory {
  idx: number;
  id: string;
  name: string;
  created_at: string;
}

export interface NewsItem {
  idx: number;
  id: string;
  title: string;
  content: string;
  category_id: string;
  is_top: boolean;
  is_pinned: boolean;
  published_at: string;
  image_url: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  category_id: string;
  image_url?: string;
  is_top?: boolean;
  is_pinned?: boolean;
}

// 获取新闻分类列表
export const getNewsCategories = async (): Promise<NewsCategory[]> => {
  const response = await get('/news-categories');
  return response.data || response;
};

// 获取新闻列表
export const getNewsList = async (): Promise<NewsItem[]> => {
  const response = await get('/news');
  return response.data || response;
};

// 根据ID获取单个新闻
export const getNewsById = async (id: string): Promise<NewsItem> => {
  const response = await get(`/news/${id}`);
  return response.data || response;
};

// 创建新闻
export const createNews = async (newsData: NewsFormData): Promise<NewsItem> => {
  const response = await post('/news', newsData);
  return response.data || response;
};

// 更新新闻
export const updateNews = async (id: string, newsData: Partial<NewsFormData>): Promise<NewsItem> => {
  const response = await put(`/news/${id}`, newsData);
  return response.data || response;
};

// 删除新闻
export const deleteNews = async (id: string): Promise<void> => {
  await del(`/news/${id}`);
};

// 搜索新闻
export const searchNews = async (params: {
  keyword?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<NewsItem[]> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  const response = await get(`/news/search?${queryParams.toString()}`);
  return response.data || response;
};