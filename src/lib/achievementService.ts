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
  AchievementAttachment,
  ApprovalResult,
  ApprovalRequest,
  ApprovalFilters,
  ApprovalStats
} from '../types/achievement';

export class AchievementService {
  
  /**
   * 清理富文本内容，只保留img标签、br换行标签和文本内容
   * @param htmlContent 原始HTML内容
   * @returns 只包含img标签和br标签的清理后内容
   */
  static cleanDescriptionForStorage(htmlContent: string): string {
    if (!htmlContent) return '';
    
    try {
      // 创建临时DOM来解析HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // 获取所有子节点
      const childNodes = Array.from(tempDiv.childNodes);
      
      let cleanContent = '';
      
      childNodes.forEach(node => {
        // 处理元素节点
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          if (element.tagName.toLowerCase() === 'img') {
            // 保留img标签
            const src = element.getAttribute('src');
            if (src) {
              cleanContent += `<img src="${src}">`;
            }
          } else if (element.tagName.toLowerCase() === 'br') {
            // 保留br换行标签
            cleanContent += '<br>';
          }
        } 
        // 处理文本节点
        else if (node.nodeType === Node.TEXT_NODE) {
          // 保留文本内容
          cleanContent += node.textContent;
        }
      });
      
      console.log('📝 原始内容:', htmlContent);
      console.log('🧹 清理后内容:', cleanContent);
      console.log('📊 保留的标签: img, br + 文本');
      
      return cleanContent;
    } catch (error) {
      console.error('清理HTML内容时发生错误:', error);
      return htmlContent; // 如果清理失败，返回原始内容
    }
  }
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
        .select('id, username, email, full_name, role, created_at')
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

  // 获取所有用户（排除role=3的用户），包含full_name字段
  static async getUsersForCollaborators(): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, full_name, role, created_at')
        .neq('role', 3) // 排除role=3的用户
        .order('full_name');

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching users for collaborators:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取协作用户列表失败' };
    }
  }

  // 获取所有学生（role=1，除了当前用户）
  static async getStudentsExceptCurrent(currentUserId: string): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, full_name, role, created_at')
        .eq('role', 1) // role=1 是学生角色
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
        
        // 优化：使用 RPC 或者预先获取学生ID（但只获取一次）
        const { data: students } = await supabase
          .from('users')
          .select('id')
          .eq('role', 1);
        
        const studentIds = students?.map(s => s.id) || [];
        
        if (studentIds.length === 0) {
          return { success: true, data: [] };
        }
        
        query = supabase
          .from('achievements')
          .select(`
            *,
            achievement_types!achievements_type_id_fkey (name),
            users!achievements_publisher_id_fkey (username, email, full_name),
            instructor:users!achievements_instructor_id_fkey (username, email, full_name)
          `)
          .in('publisher_id', studentIds)
          .order('created_at', { ascending: false });
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
          `)
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

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

      // 统一处理：获取指定用户的成果
      console.log(`📊 获取用户${userRole === 2 ? '教师' : '学生'}自己发布的成果`);
      query = supabase
        .from('achievements')
        .select(`
          *,
          achievement_types!achievements_type_id_fkey (name),
          users!achievements_publisher_id_fkey (username, email, full_name)
        `)
        .eq('publisher_id', userId)
        .order('created_at', { ascending: false });

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

      // 为每个成果获取附件信息
      const achievementsWithAttachments = await Promise.all(
        (processedData || []).map(async (achievement) => {
          const attachmentsResult = await this.getAchievementAttachments(achievement.id);
          return {
            ...achievement,
            attachments: attachmentsResult.success ? (attachmentsResult.data || []) : []
          };
        })
      );

      console.log('📊 用户相关成果查询结果:', achievementsWithAttachments?.length, '条记录');

      return { success: true, data: achievementsWithAttachments };
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

  // 根据ID获取单个成果
  static async getAchievementById(id: string): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          achievement_types!achievements_type_id_fkey (name),
          publisher:users!achievements_publisher_id_fkey (username, email),
          instructor:users!achievements_instructor_id_fkey (username, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换状态数字为字符串并获取附件
      if (data) {
        const achievement = {
          ...data,
          status: this.convertStatusFromNumber(data.status as AchievementStatusCode)
        };

        // 获取附件信息
        const attachmentsResult = await this.getAchievementAttachments(id);
        if (attachmentsResult.success) {
          achievement.attachments = attachmentsResult.data || [];
        }

        return { success: true, data: achievement };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching achievement by ID:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果详情失败' };
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
      const maxSize = bucket === 'achievement-videos' ? 200 * 1024 * 1024 : 
                     bucket === 'achievement-images' ? 5 * 1024 * 1024 :  // 图片5MB
                     bucket === 'achievement_attachments' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 文档50MB
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
      const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
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
      
      if (bucket === 'achievement_attachments' && !allowedDocumentTypes.includes(file.type)) {
        return { 
          success: false, 
          message: `❌ 文件类型不支持！\\n\\n当前文件类型: ${file.type}\\n支持的文档格式: PDF, DOC, DOCX` 
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
          const sizeLimit = bucket === 'achievement-videos' ? '200MB' : 
                          bucket === 'achievement_attachments' ? '50MB' : '5MB';
          errorMessage = `❌ 文件过大！\n\n当前大小: ${(file.size / 1024 / 1024).toFixed(2)}MB\n限制大小: ${sizeLimit}\n\n💡 请压缩文件或选择更小的文件。`;
        } else if (error.message.includes('invalid format') || error.message.includes('mime')) {
          errorMessage = `❌ 文件格式不支持！\n\n当前格式: ${file.type}\n${bucket === 'achievement-images' ? '支持格式: JPG, PNG, GIF, WebP' : bucket === 'achievement_attachments' ? '支持格式: PDF, DOC, DOCX' : '支持格式: MP4, MOV, AVI, WebM'}\n\n💡 请转换文件格式后重试。`;
        } else if (error.message.includes('Invalid key') || error.message.includes('key')) {
          errorMessage = `❌ 文件名包含无效字符！\n\n问题: 文件路径中包含空格或特殊字符\n解决方案: 系统已自动修复文件名，请重新尝试上传\n\n💡 建议使用英文文件名避免此问题。`;
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
        // 如果是Blob URL（临时URL），需要上传
        else if (src.startsWith('blob:')) {
          console.log('检测到Blob URL，准备上传:', src);
          
          const uploadPromise = fetch(src)
            .then(response => response.blob())
            .then(blob => {
              // 从blob创建File对象
              const mimeType = blob.type || 'image/png';
              const extension = mimeType.split('/')[1] || 'png';
              const fileName = `image_${Date.now()}_${index}.${extension}`;
              const filePath = `achievements/${userId}/${fileName}`;
              
              return this.uploadFile(new File([blob], fileName, { type: mimeType }), 'achievement-images', filePath)
                .then(result => ({
                  originalSrc: src,
                  newSrc: result.url
                }));
            })
            .catch(error => ({
              originalSrc: src,
              error: error instanceof Error ? error.message : 'Blob upload failed'
            }));
          
          uploadPromises.push(uploadPromise);
        }
      });

      const results = await Promise.all(uploadPromises);
      
      // 替换HTML中的图片URL，按照要求的格式存储：<br><img src="..."><br>
      let processedHtml = htmlContent;
      results.forEach(result => {
        if (result.newSrc) {
          // 创建正确的img标签格式
          const imgTag = `<img src="${result.newSrc}">`;
          // 替换原有的img标签
          processedHtml = processedHtml.replace(new RegExp(`<img[^>]*src="${result.originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'), imgTag);
        }
      });

      return { success: true, processedContent: processedHtml };
    } catch (error) {
      console.error('Error processing rich text images:', error);
      return { success: false, message: error instanceof Error ? error.message : '处理图片失败' };
    }
  }

  // 创建成果
  static async createAchievement(
    achievementData: CreateAchievementRequest, 
    directPublish = false // 是否直接发布（无需审批）
  ): Promise<{ success: boolean; data?: Achievement; message?: string }> {
    try {
      // 根据用户角色决定状态
      const status = directPublish ? STATUS_TO_NUMBER['approved'] : STATUS_TO_NUMBER['pending'];
      
      // 直接使用数字状态，因为数据库字段是smallint类型
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          ...achievementData,
          status, // 根据directPublish参数决定状态
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
      // 如果状态是字符串，需要转换为数字
      let finalUpdateData = { ...updateData };
      if (updateData.status && typeof updateData.status === 'string') {
        finalUpdateData = {
          ...updateData,
          status: STATUS_TO_NUMBER[updateData.status as AchievementStatus]
        };
      }

      // 移除 updated_at 字段，因为数据库表中没有这个字段
      const { updated_at, ...updateFields } = finalUpdateData;

      const { data, error } = await supabase
        .from('achievements')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      // 转换数据中的数字状态为字符串，以便前端使用
      if (data && data.status) {
        data.status = this.convertStatusFromNumber(data.status as AchievementStatusCode);
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
            full_name,
            class_id
          ),
          instructor:users!achievements_instructor_id_fkey (
            id,
            username,
            email,
            full_name
          ),
          parent:users!achievements_parents_id_fkey (
            id,
            username,
            email,
            full_name
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
          users!achievements_publisher_id_fkey (username, email, full_name, role),
          instructor:users!achievements_instructor_id_fkey (username, email, full_name, role)
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

  // 获取成果附件
  static async getAchievementAttachments(achievementId: string): Promise<{ success: boolean; data?: AchievementAttachment[]; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('achievement_attachments')
        .select('*')
        .eq('achievement_id', achievementId)
        .order('created_at', { ascending: true });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data: data as AchievementAttachment[] || [] };
    } catch (error) {
      console.error('Error fetching achievement attachments:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取成果附件失败' };
    }
  }

  // 获取成果的最新审批记录
  static async getLatestApprovalRecord(achievementId: string): Promise<{ success: boolean; data?: { feedback: string; reviewed_at: string; reviewer?: { username: string } }; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('approval_records')
        .select(`
          feedback,
          reviewed_at,
          reviewer:users!approval_records_reviewer_id_fkey (username)
        `)
        .eq('achievement_id', achievementId)
        .order('reviewed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到审批记录
          return { success: true, data: undefined };
        }
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching latest approval record:', error);
      return { success: false, message: error instanceof Error ? error.message : '获取审批记录失败' };
    }
  }

  // 添加成果附件
  static async addAchievementAttachment(
    achievementId: string, 
    fileName: string, 
    fileUrl: string, 
    fileSize: number,
    fileType: string
  ): Promise<{ success: boolean; data?: AchievementAttachment; message?: string }> {
    try {
      const attachmentData = {
        achievement_id: achievementId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('achievement_attachments')
        .insert([attachmentData])
        .select()
        .single();

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
          ? (error as { message: string }).message 
          : String(error);
        throw new Error(errorMessage);
      }

      return { success: true, data: data as AchievementAttachment };
    } catch (error) {
      console.error('Error adding achievement attachment:', error);
      return { success: false, message: error instanceof Error ? error.message : '添加成果附件失败' };
    }
  }

  // 上传并保存附件
  static async uploadAndSaveAttachment(
    achievementId: string, 
    file: File
  ): Promise<{ success: boolean; data?: AchievementAttachment; message?: string }> {
    try {
      // 上传文件到存储
      // 使用UUID和原始文件扩展名生成安全的文件名
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const uuid = Date.now().toString(36) + Math.random().toString(36).substring(2);
      const fileName = `attachment_${uuid}${fileExtension}`;
      const filePath = `achievements/${achievementId}/${fileName}`;
      
      const uploadResult = await this.uploadFile(file, 'achievement_attachments', filePath);
      
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, message: uploadResult.message || '文件上传失败' };
      }

      // 保存附件信息到数据库
      const saveResult = await this.addAchievementAttachment(
        achievementId, 
        file.name, 
        uploadResult.url, 
        file.size,
        file.type
      );

      return saveResult;
    } catch (error) {
      console.error('Error uploading and saving attachment:', error);
      return { success: false, message: error instanceof Error ? error.message : '上传并保存附件失败' };
    }
  }

  // 处理富文本中的图片，上传到achievement-images桶
  static async processRichTextImages(htmlContent: string, userId: string): Promise<{ success: boolean; processedContent?: string; message?: string }> {
    try {
      // 创建一个临时的DOM元素来解析HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      const images = tempDiv.querySelectorAll('img');
      const uploadPromises: Promise<{ element: HTMLImageElement; newUrl?: string; error?: string }>[] = [];
      
      // 为每个图片创建上传任务
      images.forEach((img, index) => {
        const uploadPromise = new Promise<{ element: HTMLImageElement; newUrl?: string; error?: string }>((resolve) => {
          const src = img.src;
          
          // 如果已经是achievement-images桶的URL，跳过上传
          if (src.includes('achievement-images/') && src.includes('supabase')) {
            resolve({ element: img, newUrl: src });
            return;
          }
          
          // 如果是base64图片，需要上传
          if (src.startsWith('data:image/')) {
            // 将base64转换为Blob
            const base64Data = src.split(',')[1];
            const mimeType = src.match(/data:image\/([^;]+)/)?.[1] || 'image/jpeg';
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            const file = new File([blob], `image_${Date.now()}_${index}.jpg`, { type: mimeType });
            
            // 上传到achievement-images桶
            this.uploadFileToStorage(file, userId, `richText_${Date.now()}_${index}`)
              .then(result => {
                if (result.success && result.url) {
                  resolve({ element: img, newUrl: result.url });
                } else {
                  resolve({ element: img, error: result.message || '上传失败' });
                }
              })
              .catch(error => {
                resolve({ element: img, error: error.message || '上传异常' });
              });
          } else if (src.startsWith('blob:')) {
            // 处理blob URL（从FileReader创建的临时URL）
            fetch(src)
              .then(response => response.blob())
              .then(blob => {
                const mimeType = blob.type || 'image/jpeg';
                const file = new File([blob], `image_${Date.now()}_${index}.jpg`, { type: mimeType });
                
                this.uploadFileToStorage(file, userId, `richText_${Date.now()}_${index}`)
                  .then(result => {
                    if (result.success && result.url) {
                      resolve({ element: img, newUrl: result.url });
                    } else {
                      resolve({ element: img, error: result.message || '上传失败' });
                    }
                  })
                  .catch(error => {
                    resolve({ element: img, error: error.message || '上传异常' });
                  });
              })
              .catch(error => {
                resolve({ element: img, error: 'blob处理失败: ' + error.message });
              });
          } else {
            // 其他HTTP图片，直接使用
            resolve({ element: img, newUrl: src });
          }
        });
        
        uploadPromises.push(uploadPromise);
      });
      
      // 等待所有图片上传完成
      const results = await Promise.all(uploadPromises);
      
      // 统计上传结果
      let successCount = 0;
      let errorMessages: string[] = [];
      
      results.forEach(result => {
        if (result.newUrl) {
          result.element.src = result.newUrl;
          successCount++;
        } else if (result.error) {
          errorMessages.push(result.error);
        }
      });
      
      // 返回处理后的HTML
      const processedHtml = tempDiv.innerHTML;
      
      if (errorMessages.length > 0) {
        return {
          success: true,
          processedContent: processedHtml,
          message: `${successCount}张图片上传成功，${errorMessages.length}张图片上传失败：${errorMessages.join('; ')}`
        };
      } else {
        return {
          success: true,
          processedContent: processedHtml,
          message: `成功处理${successCount}张图片`
        };
      }
      
    } catch (error) {
      console.error('处理富文本图片时发生错误:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '处理图片时发生未知错误'
      };
    }
  }

  // 上传文件到存储的辅助方法
  private static async uploadFileToStorage(file: File, userId: string, fileNamePrefix: string): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      // 动态导入storage服务以避免循环依赖
      const { uploadToAchievementImagesBucket } = await import('../services/supabaseStorageService');
      
      const fileName = `${fileNamePrefix}_${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
      const filePath = `achievements/${userId}/${fileName}`;
      
      const result = await uploadToAchievementImagesBucket(file, fileName, filePath);
      
      return result;
    } catch (error) {
      console.error('上传文件到存储失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '上传失败'
      };
    }
  }

  // 获取教师待审批的成果数量
  static async getPendingAchievementsCount(instructorId: string): Promise<{ success: boolean; data?: number; message?: string }> {
    try {
      if (!instructorId) {
        return { success: false, message: '教师ID为空' };
      }

      console.log('🔍 查询待审批数量 - 教师ID:', instructorId);

      // 先查询所有相关记录，用于调试
      const { data: allRecords, error: debugError } = await supabase
        .from('achievements')
        .select('id, title, status, instructor_id, publisher_id')
        .eq('instructor_id', instructorId);

      if (debugError) {
        console.error('❌ 调试查询失败:', debugError);
      } else {
        console.log('📊 教师所有成果:', allRecords);
        console.log('📊 状态分布:', allRecords?.reduce((acc: any, item: any) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}));
      }

      // 查询待审批数量 - 使用正确的状态值：1 = pending
      const { count, error } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', instructorId)
        .eq('status', 1); // 1 = pending 状态（正确的值）

      if (error) {
        console.error('获取待审批数量失败:', error);
        return { success: false, message: '获取待审批数量失败' };
      }

      console.log('🎯 待审批成果数量:', count);
      return { success: true, data: count || 0 };

      return { success: true, data: count };
    } catch (error) {
      console.error('获取待审批数量时发生错误:', error);
      return { success: false, message: '获取待审批数量失败' };
    }
  }
}

export default AchievementService;