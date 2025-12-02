// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 请求配置
const requestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// 通用请求函数
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...requestConfig,
      ...options,
      headers: {
        ...requestConfig.headers,
        ...options.headers,
      },
    };

    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API Response:`, data);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// GET 请求
export const get = async (endpoint: string) => {
  return apiRequest(endpoint, { method: 'GET' });
};

// POST 请求
export const post = async (endpoint: string, data: any) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT 请求
export const put = async (endpoint: string, data: any) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE 请求
export const del = async (endpoint: string) => {
  return apiRequest(endpoint, { method: 'DELETE' });
};