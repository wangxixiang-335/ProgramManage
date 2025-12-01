import { supabase } from './supabase';
import { 
  Achievement, 
  CreateAchievementRequest, 
  UpdateAchievementRequest, 
  AchievementType, 
  User, 
  AchievementStatus,
  AchievementStatusCode,
  STATUS_TO_NUMBER,
  NUMBER_TO_STATUS,
  ACHIEVEMENT_TYPES,
  AchievementWithUsers,
  ApprovalResult,
  ApprovalRequest,
  ApprovalFilters,
  ApprovalStats
} from '../types/achievement';

export class AchievementService {
  // 转换状态数字为字符串（用于从数据库读取数据时）
  private static convertStatusFromNumber(statusNumber: AchievementStatusCode): AchievementStatus {
    return NUMBER_TO_STATUS[statusNumber] || 'pending';
  }

  // 获取所有成果类型
  static async getAchievementTypes(): Promise<{ success: boolean; data?: AchievementType[]; message?: string }> {
    try {
      // 如果数据库有achievement_types表，则从数据库获取
      const { data, error } = await supabase
        .from('achievement_types')
        .select('*')
        .order('created_at');

      if (error) {
        console.log('Failed to fetch achievement types from database, using fallback:', error.message);
        // 使用预定义的数据作为fallback
        return { success: true, data: ACHIEVEMENT_TYPES };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching achievement types:', error);
      return { success: false, message: '获取成果类型失败' };
    }
  }

  // 获取用户列表（根据角色筛选）
  static async getUsersByRole(role: number): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, created_at')
        .eq('role', role)
        .order('username');

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取用户列表失败' };
    }
  }

  // 获取所有学生（role=2，除了当前用户）
  static async getStudentsExceptCurrent(currentUserId: string): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, created_at')
        .eq('role', 2)
        .neq('id', currentUserId)
        .order('username');

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取学生列表失败' };
    }
  }

  // 根据用户角色获取成果列表
  static async getAchievementsByRole(userRole: number, userId?: string): Promise<{ success: boolean; data?: Achievement[]; message?: string }> {
    try {
      let query;

      if (userRole === 1) {
        // 学生 (role=1) - 获取自己的所有成果
        console.log('📊 获取学生成果，用户ID:', userId);
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email)
          `)
          .eq('publisher_id', userId);
      } else if (userRole === 2) {
        // 教师 (role=2) - 获取所有学生的成果
        console.log('📊 获取所有学生成果');
        
        // 先获取所有学生ID
        const { data: students, error: studentsError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 1);
        
        if (studentsError) {
          throw new Error(studentsError.message);
        }
        
        const studentIds = students?.map(s => s.id) || [];
        
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email),
            instructor:users!achievements_instructor_id_fkey (username, email)
          `)
          .in('publisher_id', studentIds);
      } else {
        // 管理员或其他角色 - 获取所有成果
        console.log('📊 获取所有成果');
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email),
            instructor:users!achievements_instructor_id_fkey (username, email)
          `);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换状态数字为字符串
      const processedData = data?.map(achievement => ({
        ...achievement,
        status: this.convertStatusFromNumber(achievement.status as AchievementStatusCode)
      }));

      console.log(`📊 成果查询结果 (${userRole === 1 ? '学生' : userRole === 2 ? '教师' : '全部'}):`, processedData?.length, '条记录');

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Error fetching achievements by role:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果列表失败' };
    }
  }

  // 根据用户ID和角色获取相关成果列表
  static async getAchievementsByUser(userRole: number, userId: string): Promise<{ success: boolean; data?: Achievement[]; message?: string }> {
    try {
      console.log('📊 获取用户相关成果，用户角色:', userRole, '用户ID:', userId);
      
      let query;

      if (userRole === 2) {
        // 教师 (role=2) - 获取自己发布的成果（publisher_id 等于教师ID）
        console.log('📊 获取教师自己发布的成果');
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email)
          `)
          .eq('publisher_id', userId);
      } else {
        // 学生 (role=1) - 获取自己的成果
        console.log('📊 获取学生自己的成果');
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email)
          `)
          .eq('publisher_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换状态数字为字符串
      const processedData = data?.map(achievement => ({
        ...achievement,
        status: this.convertStatusFromNumber(achievement.status as AchievementStatusCode)
      }));

      console.log('📊 用户相关成果查询结果:', processedData?.length, '条记录');

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Error fetching achievements by user:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取用户相关成果列表失败' };
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(userId: string): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 检查是否找到了用户
      if (!data || data.length === 0) {
        return { success: false, message: `用户ID ${userId} 不存在` };
      }

      // 如果找到多个用户，取第一个
      if (data.length > 1) {
        console.warn(`警告: 找到 ${data.length} 个相同ID的用户，使用第一个`);
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取用户信息失败' };
    }
  }

  // 上传文件到Supabase Storage
  static async uploadFile(file: File, bucket: string, path: string): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      console.log(`开始上传文件: ${file.name} 到存储桶: ${bucket}`);
      console.log(`文件路径: ${path}`);
      console.log(`文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`文件类型: ${file.type}`);
      
      // 验证文件大小（根据存储桶类型设置不同限制）
      const maxSize = bucket === 'achievement-videos' ? 200 * 1024 * 1024 : 5 * 1024 * 1024; // 视频200MB，图片5MB
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return { 
          success: false, 
          message: `❌ 文件过大！\\n\\n文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB\\n最大限制: ${maxSizeMB}MB\\n\\n💡 建议：压缩文件或选择更小的文件。` 
        };
      }

      // 验证文件类型
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      
      if (bucket === 'achievement-images' && !allowedImageTypes.includes(file.type)) {
        return { 
          success: false, 
          message: `❌ 文件类型不支持！\\n\\n当前文件类型: ${file.type}\\n支持的图片格式: JPG, PNG, GIF, WebP` 
        };
      }
      
      if (bucket === 'achievement-videos' && !allowedVideoTypes.includes(file.type)) {
        return { 
          success: false, 
          message: `❌ 文件类型不支持！\\n\\n当前文件类型: ${file.type}\\n支持的视频格式: MP4, MOV, AVI, WebM` 
        };
      }

      // 尝试上传文件
      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error(`上传失败，错误详情:`, error);
        
        // 详细错误处理
        let errorMessage = '文件上传失败';
        
        if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
          errorMessage = `❌ 存储桶 "${bucket}" 不存在！\n\n🔧 解决方案：\n1. 打开 Supabase 控制台: https://supabase.com/dashboard\n2. 选择项目 → 进入 Storage 页面\n3. 创建存储桶 "${bucket}"\n4. 运行 fix-storage-policies.sql 文件设置权限\n\n⏳ 完成后请重新尝试上传。`;
        } else if (error.message.includes('row-level security') || error.message.includes('permission') || error.message.includes('PGRST301')) {
          errorMessage = `❌ 权限不足！\n\n🔧 解决方案：\n1. 打开 Supabase 控制台的 SQL 编辑器\n2. 运行 fix-storage-policies.sql 文件\n3. 确保存储桶设置为公开访问\n\n💡 这将更新存储桶的访问权限策略。`;
        } else if (error.message.includes('file too large') || error.message.includes('size')) {
          errorMessage = `❌ 文件过大！\n\n当前大小: ${(file.size / 1024 / 1024).toFixed(2)}MB\n限制大小: ${bucket === 'achievement-videos' ? '200MB' : '5MB'}\n\n💡 请压缩文件或选择更小的文件。`;
        } else if (error.message.includes('invalid format') || error.message.includes('mime')) {
          errorMessage = `❌ 文件格式不支持！\n\n当前格式: ${file.type}\n${bucket === 'achievement-images' ? '支持格式: JPG, PNG, GIF, WebP' : '支持格式: MP4, MOV, AVI, WebM'}\n\n💡 请转换文件格式后重试。`;
        }
        
        return { 
          success: false, 
          message: errorMessage 
        };
      }

      console.log(`✅ 文件上传成功: ${file.name}`);
      console.log(`上传数据:`, data);

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      console.log(`🔗 获取公共URL成功: ${publicUrl}`);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ 文件上传异常:', error);
      return { 
        success: false, 
        message: `❌ 上传过程中发生未知错误：${error instanceof Error ? error.message : '未知错误'}\n\n🔄 建议：\n1. 检查网络连接\n2. 刷新页面重试\n3. 联系技术支持` 
      };
    }
  }

  // 处理富文本中的图片，上传并替换URL
  static async processRichTextImages(htmlContent: string, userId: string): Promise<{ success: boolean; processedContent?: string; message?: string }> {
    try {
      // 创建临时DOM来解析HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      const images = tempDiv.querySelectorAll('img');
      const uploadPromises: Promise<{ originalSrc: string; newSrc?: string; error?: string }>[] = [];

      images.forEach((img, index) => {
        const src = img.src;
        
        // 如果是base64图片，需要上传
        if (src.startsWith('data:image/')) {
          // 从base64创建File对象
          const base64Data = src.split(',')[1];
          const mimeType = src.match(/data:image\/(\w+);/)?.[1] || 'png';
          
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: `image/${mimeType}` });
          
          const fileName = `image_${Date.now()}_${index}.${mimeType}`;
          const filePath = `achievements/${userId}/${fileName}`;
          
          const uploadPromise = this.uploadFile(new File([blob], fileName, { type: `image/${mimeType}` }), 'achievement-images', filePath)
            .then(result => ({
              originalSrc: src,
              newSrc: result.url
            }))
            .catch(error => ({
              originalSrc: src,
              error: error instanceof Error ? error.message : 'Upload failed'
            }));
          
          uploadPromises.push(uploadPromise);
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // 替换HTML中的图片URL
      let processedHtml = htmlContent;
      results.forEach(result => {
        if (result.newSrc) {
          processedHtml = processedHtml.replace(result.originalSrc, result.newSrc);
        }
      });

      return { success: true, processedContent: processedHtml };
    } catch (error) {
      console.error('Error processing rich text images:', error);
      return { success: false, message: error instanceof Error ? error.message : '处理图片失败' };
    }
  }

  // 创建成果
  static async createAchievement(achievementData: CreateAchievementRequest): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      // 直接使用数字状态，因为数据库字段是smallint类型
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          ...achievementData,
          status: STATUS_TO_NUMBER['pending'], // 新创建的成果默认为待审核状态（转换为数字）
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换数据中的数字状态为字符串，以便前端使用
      if (data) {
        data.status = this.convertStatusFromNumber(data.status as AchievementStatusCode);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating achievement:', error);
      return { success: false, message: error instanceof Error ? error.message : '创建成果失败' };
    }
  }

  // 更新成果
  static async updateAchievement(id: string, updateData: UpdateAchievementRequest): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating achievement:', error);
      return { success: false, message: error instanceof Error ? error.message : '更新成果失败' };
    }
  }

  // 保存草稿
  static async saveDraft(achievementData: Omit<CreateAchievementRequest, 'status'>): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          ...achievementData,
          status: STATUS_TO_NUMBER['draft'], // 转换为数字状态
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换数据中的数字状态为字符串
      if (data) {
        data.status = this.convertStatusFromNumber(data.status as AchievementStatusCode);
      }

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error saving draft:', error);
      return { success: false, message: error instanceof Error ? error.message : '保存草稿失败' };
    }
  }

  // 获取用户的成果列表
  static async getUserAchievements(userId: string, status?: AchievementStatus): Promise<{ success: boolean; data?: Achievement[]; message?: string }> {
    try {
      let query = supabase
        .from('achievements')
        .select('*')
        .eq('publisher_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', STATUS_TO_NUMBER[status]);
      }

      const { data, error } = await query;

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果列表失败' };
    }
  }

  // 获取单个成果详情
  static async getAchievementById(id: string): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, message: '成果不存在' };
        }
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching achievement:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果详情失败' };
    }
  }

  // ==================== 审批相关方法 ====================

  // 获取待审批的成果列表（带用户信息）
  static async getPendingAchievements(filters: ApprovalFilters = {}): Promise<{ success: boolean; data?: AchievementWithUsers[]; message?: string; total?: number }> {
    try {
      let query = supabase
        .from('achievements')
        .select(`
          *,
          publisher:users!achievements_publisher_id_fkey (
            id,
            username,
            email
          ),
          instructor:users!achievements_instructor_id_fkey (
            id,
            username,
            email
          ),
          parent:users!achievements_parents_id_fkey (
            id,
            username,
            email
          ),
          achievement_type:achievement_types!achievements_type_id_fkey (
            id,
            name
          )
        `)
        .eq('status', STATUS_TO_NUMBER['pending'])
        .order('created_at', { ascending: false });

      // 应用筛选条件
      if (filters.type_id) {
        query = query.eq('type_id', filters.type_id);
      }
      
      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      
      // 通过publisher用户名筛选
      if (filters.student_name) {
        query = query.ilike('publisher.username', `%${filters.student_name}%`);
      }

      // 分页处理
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { 
        success: true, 
        data: data as AchievementWithUsers[] || [],
        total: count || 0 
      };
    } catch (error) {
      console.error('Error fetching pending achievements:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取待审批成果失败' };
    }
  }

  // 获取所有需要审批的成果（按教师筛选）
  static async getAchievementsForInstructor(instructorId: string, filters: ApprovalFilters = {}): Promise<{ success: boolean; data?: AchievementWithUsers[]; message?: string; total?: number }> {
    try {
      let query = supabase
        .from('achievements')
        .select(`
          *,
          publisher:users!achievements_publisher_id_fkey (
            id,
            username,
            email,
            class_id
          ),
          instructor:users!achievements_instructor_id_fkey (
            id,
            username,
            email
          ),
          parent:users!achievements_parents_id_fkey (
            id,
            username,
            email
          ),
          achievement_type:achievement_types!achievements_type_id_fkey (
            id,
            name
          )
        `)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      // 应用筛选条件
      if (filters.status) {
        query = query.eq('status', STATUS_TO_NUMBER[filters.status]);
      }
      
      if (filters.type_id) {
        query = query.eq('type_id', filters.type_id);
      }
      
      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      
      if (filters.student_name) {
        query = query.ilike('publisher.username', `%${filters.student_name}%`);
      }
      
      if (filters.class_id) {
        query = query.eq('publisher.class_id', filters.class_id);
      }

      // 分页处理
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.page && filters.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { 
        success: true, 
        data: data as AchievementWithUsers[] || [],
        total: count || 0 
      };
    } catch (error) {
      console.error('Error fetching achievements for instructor:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取教师成果失败' };
    }
  }

  // 获取审批统计信息
  static async getApprovalStats(instructorId: string): Promise<{ success: boolean; data?: ApprovalStats; message?: string }> {
    try {
      // 获取各状态的成果数量
      const { data: pendingData, error: pendingError } = await supabase
        .from('achievements')
        .select('id')
        .eq('instructor_id', instructorId)
        .eq('status', STATUS_TO_NUMBER['pending']);

      const { data: approvedData, error: approvedError } = await supabase
        .from('achievements')
        .select('id')
        .eq('instructor_id', instructorId)
        .eq('status', STATUS_TO_NUMBER['approved']);

      const { data: rejectedData, error: rejectedError } = await supabase
        .from('achievements')
        .select('id')
        .eq('instructor_id', instructorId)
        .eq('status', STATUS_TO_NUMBER['rejected']);

      if (pendingError || approvedError || rejectedError) {
        throw new Error('获取统计数据失败');
      }

      const stats: ApprovalStats = {
        pending_count: pendingData?.length || 0,
        approved_count: approvedData?.length || 0,
        rejected_count: rejectedData?.length || 0,
        total_count: (pendingData?.length || 0) + (approvedData?.length || 0) + (rejectedData?.length || 0)
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching approval stats:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取统计信息失败' };
    }
  }

  // 记录审批历史
  static async recordApprovalHistory(request: any, reviewerId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('approval_records')
        .insert([{
          achievement_id: request.id,
          reviewer_id: reviewerId,
          status: request.action === 'approve' ? 1 : 0, // 1是通过/0是驳回
          feedback: request.action === 'reject' ? request.reject_reason : (request.score ? `评分：${request.score}分` : ''),
          reviewed_at: new Date().toISOString()
        }]);

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, message: '审批记录保存成功' };
    } catch (error) {
      console.error('Error recording approval history:', error);
      return { success: false, message: error instanceof Error ? error.message : '保存审批记录失败' };
    }
  }

  // 审批成果（通过或拒绝）
  static async reviewAchievement(request: ApprovalRequest): Promise<ApprovalResult> {
    try {
      const updateData: UpdateAchievementRequest = {};

      if (request.action === 'approve') {
        updateData.status = STATUS_TO_NUMBER['approved'];
        if (request.score !== undefined) {
          updateData.score = request.score;
        }
      } else if (request.action === 'reject') {
        updateData.status = STATUS_TO_NUMBER['rejected'];
      }

      // 更新成果状态
      const { error: updateError } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', request.id);

      if (updateError) {
        const errorMessage = typeof updateError === 'object' && updateError !== null && 'message' in updateError 
          ? (updateError as { message: string }).message 
          : String(updateError);
        throw new Error(errorMessage);
      }

      // 记录审批历史到approval_records表
      const reviewResult = await this.recordApprovalHistory(request, (request as any).reviewer_id || '');
      if (!reviewResult.success) {
        console.warn('审批记录保存失败:', reviewResult.message);
      }

      const actionText = request.action === 'approve' ? '通过' : '驳回';
      return { 
        success: true, 
        message: `成果${actionText}成功${request.score ? `，分数：${request.score}` : ''}` 
      };
    } catch (error) {
      console.error('Error reviewing achievement:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '审批操作失败' 
      };
    }
  }

  // 批量审批
  static async batchReviewAchievements(requests: ApprovalRequest[]): Promise<ApprovalResult> {
    try {
      const results = [];
      
      for (const request of requests) {
        const result = await this.reviewAchievement(request);
        results.push(result);
        
        if (!result.success) {
          // 如果有任何一个失败，返回失败结果
          return result;
        }
      }

      return { 
        success: true, 
        message: `成功批量审批${requests.length}个成果` 
      };
    } catch (error) {
      console.error('Error batch reviewing achievements:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '批量审批失败' 
      };
    }
  }

  // 删除成果
  static async deleteAchievement(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, message: '删除成功' };
    } catch (error) {
      console.error('Error deleting achievement:', error);
      return { success: false, message: error instanceof Error ? error.message : '删除成果失败' };
    }
  }

  // 获取所有成果（不受角色限制）
  static async getAllAchievements(): Promise<{ success: boolean; data?: Achievement[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          achievement_types!achievements_type_id_fkey (name),
          users!achievements_publisher_id_fkey (username, email),
          instructor:users!achievements_instructor_id_fkey (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换状态数字为字符串
      const processedData = data?.map(achievement => ({
        ...achievement,
        status: this.convertStatusFromNumber(achievement.status as AchievementStatusCode)
      }));

      return { success: true, data: processedData };
    } catch (error) {
      console.error('Error fetching all achievements:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取所有成果失败' };
    }
  }

  // 获取成果详情（带用户信息）
  static async getAchievementWithUsersById(id: string): Promise<{ success: boolean; data?: AchievementWithUsers; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          publisher:users!achievements_publisher_id_fkey (
            id,
            username,
            email,
            class_id
          ),
          instructor:users!achievements_instructor_id_fkey (
            id,
            username,
            email
          ),
          parent:users!achievements_parents_id_fkey (
            id,
            username,
            email
          ),
          achievement_type:achievement_types!achievements_type_id_fkey (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, message: '成果不存在' };
        }
        throw new Error(error.message);
      }

      return { success: true, data: data as AchievementWithUsers };
    } catch (error) {
      console.error('Error fetching achievement with users:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果详情失败' };
    }
  }
}

export default AchievementService;