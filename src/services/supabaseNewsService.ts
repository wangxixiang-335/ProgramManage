import { supabase, NewsCategory, NewsItem, NewsFormData } from '../lib/supabase';

// 重新导出类型供其他模块使用
export type { NewsCategory, NewsItem, NewsFormData };

// 新闻分类服务
export const getNewsCategories = async (): Promise<NewsCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取新闻分类失败:', error);
      throw error;
    }

    console.log('新闻分类数据:', data);
    return data || [];
  } catch (error) {
    console.error('获取新闻分类异常:', error);
    throw error;
  }
};

// 新闻列表服务
export const getNewsList = async (): Promise<NewsItem[]> => {
  try {
    // 并行获取新闻和分类数据
    const [newsResult, categoriesResult] = await Promise.all([
      supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false }),
      supabase
        .from('news_categories')
        .select('*')
    ]);

    if (newsResult.error) {
      console.error('获取新闻列表失败:', newsResult.error);
      throw newsResult.error;
    }

    if (categoriesResult.error) {
      console.error('获取新闻分类失败:', categoriesResult.error);
      throw categoriesResult.error;
    }

    const newsData = newsResult.data || [];
    const categoriesData = categoriesResult.data || [];

    // 创建分类映射
    const categoryMap = new Map();
    categoriesData.forEach(category => {
      categoryMap.set(category.id, category);
    });

    console.log('新闻列表数据:', newsData);
    console.log('分类数据:', categoriesData);
    
    return newsData || [];
  } catch (error) {
    console.error('获取新闻列表异常:', error);
    throw error;
  }
};

// 根据ID获取单个新闻
export const getNewsById = async (id: string): Promise<NewsItem> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取新闻详情失败:', error);
      throw error;
    }

    if (!data) {
      throw new Error('新闻不存在');
    }

    console.log('新闻详情数据:', data);
    return data;
  } catch (error) {
    console.error('获取新闻详情异常:', error);
    throw error;
  }
};

// 创建新闻
export const createNews = async (newsData: NewsFormData): Promise<NewsItem> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newsData,
        published_at: new Date().toISOString(),
        is_top: newsData.is_top || false,
        is_pinned: newsData.is_pinned || false,
      })
      .select()
      .single();

    if (error) {
      console.error('创建新闻失败:', error);
      throw error;
    }

    console.log('创建新闻成功:', data);
    return data;
  } catch (error) {
    console.error('创建新闻异常:', error);
    throw error;
  }
};

// 更新新闻
export const updateNews = async (id: string, newsData: Partial<NewsFormData>): Promise<NewsItem> => {
  try {
    const { data, error } = await supabase
      .from('news')
      .update(newsData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新新闻失败:', error);
      throw error;
    }

    if (!data) {
      throw new Error('新闻不存在或更新失败');
    }

    console.log('更新新闻成功:', data);
    return data;
  } catch (error) {
    console.error('更新新闻异常:', error);
    throw error;
  }
};

// 删除新闻
export const deleteNews = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除新闻失败:', error);
      throw error;
    }

    console.log('删除新闻成功:', id);
  } catch (error) {
    console.error('删除新闻异常:', error);
    throw error;
  }
};

// 搜索新闻
export const searchNews = async (params: {
  keyword?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<NewsItem[]> => {
  try {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });

    // 关键词搜索
    if (params.keyword) {
      query = query.or(`title.ilike.%${params.keyword}%,content.ilike.%${params.keyword}%`);
    }

    // 分类筛选
    if (params.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    // 日期范围筛选
    if (params.start_date) {
      query = query.gte('published_at', params.start_date);
    }
    if (params.end_date) {
      query = query.lte('published_at', params.end_date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('搜索新闻失败:', error);
      throw error;
    }

    console.log('搜索新闻结果:', data);
    return data || [];
  } catch (error) {
    console.error('搜索新闻异常:', error);
    throw error;
  }
};