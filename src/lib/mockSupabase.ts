// Mock Supabase client for testing when API keys are invalid
export const mockSupabase = {
  auth: {
    signUp: async (data: any) => {
      console.log('🔐 [Mock] 用户注册:', data.email);
      return { 
        data: { user: { id: '550e8400-e29b-41d4-a716-446655440000', email: data.email }, session: null }, 
        error: null 
      };
    },
    signIn: async (data: any) => {
      console.log('🔐 [Mock] 用户登录:', data.email);
      return { 
        data: { user: { id: '550e8400-e29b-41d4-a716-446655440000', email: data.email }, session: { access_token: 'mock-token' } }, 
        error: null 
      };
    },
    signOut: async () => {
      console.log('🔐 [Mock] 用户登出');
      return { error: null };
    },
    getCurrentUser: async () => {
      return { 
        data: { user: { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@example.com' } }, 
        error: null 
      };
    },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => {
        console.log(`📊 [Mock] 查询表 ${table}:`, { column, value });
        return Promise.resolve({
          data: table === 'users' ? [{ 
            id: '550e8400-e29b-41d4-a716-446655440000', // 有效的 UUID 格式
            email: 'test@example.com', 
            username: 'testuser',
            name: '测试用户',
            role: 1  // 教师 role=1
          }] : table === 'achievement_types' ? [
            { id: 'type-1', name: '项目报告' },
            { id: 'type-2', name: '论文' },
            { id: 'type-3', name: '软件作品' }
          ] : [],
          error: null
        });
      },
      order: () => {
        console.log(`📊 [Mock] 排序查询表 ${table}`);
        return Promise.resolve({ data: [], error: null });
      },
      limit: () => {
        console.log(`📊 [Mock] 限制查询表 ${table}`);
        return Promise.resolve({ data: [], error: null });
      },
      in: (column: string, values: any[]) => {
        console.log(`📊 [Mock] IN查询表 ${table}:`, { column, values });
        return Promise.resolve({ data: [], error: null });
      },
      single: () => {
        console.log(`📊 [Mock] 单条查询表 ${table}`);
        return Promise.resolve({ 
          data: table === 'users' ? { 
            id: '550e8400-e29b-41d4-a716-446655440000', 
            email: 'test@example.com', 
            username: 'testuser',
            name: '测试用户',
            role: 1  // 教师 role=1
          } : table === 'achievement_types' ? { id: 'type-1', name: '项目报告' } : null,
          error: null 
        });
      }
    }),
    insert: (data: any) => {
      console.log(`📊 [Mock] 插入数据到表 ${table}:`, data);
      return Promise.resolve({
        data: { ...data, id: 'mock-id-' + Date.now() },
        error: null
      });
    },
    update: (data: any) => ({
      eq: (column: string, value: any) => {
        console.log(`📊 [Mock] 更新表 ${table}:`, { data, column, value });
        return Promise.resolve({
          data: { ...data, id: 'mock-id-' + Date.now() },
          error: null
        });
      }
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        console.log(`📊 [Mock] 删除表 ${table} 数据:`, { column, value });
        return Promise.resolve({
          data: null,
          error: null
        });
      }
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any, options?: any) => {
        console.log(`📤 [Mock] 上传文件到 ${bucket}:`, path, file?.name || 'unknown');
        return Promise.resolve({
          data: { 
            path: `mock-${bucket}/${path}`,
            id: `mock-file-${Date.now()}`,
            fullPath: `mock-storage/${bucket}/${path}`
          },
          error: null
        });
      },
      getPublicUrl: (path: string) => {
        const mockUrl = `https://mock-storage.supabase.co/storage/v1/object/public/${path}`;
        console.log(`🔗 [Mock] 获取公共URL:`, mockUrl);
        return {
          data: { publicUrl: mockUrl }
        };
      },
      remove: (paths: string[]) => {
        console.log(`🗑️ [Mock] 删除文件:`, paths);
        return Promise.resolve({
          data: {},
          error: null
        });
      },
      list: (path?: string, options?: any) => {
        console.log(`📋 [Mock] 列出文件:`, path);
        return Promise.resolve({
          data: [
            { id: 'mock-1', name: 'mock-file-1.jpg', size: 1024 },
            { id: 'mock-2', name: 'mock-file-2.mp4', size: 2048 }
          ],
          error: null
        });
      }
    })
  }
};