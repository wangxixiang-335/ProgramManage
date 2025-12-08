// 成果类型
export interface AchievementType {
  id: string;
  name: string;
  created_at: string;
}

// 成果状态（字符串类型）
export type AchievementStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// 成果状态（数字类型 - 对应数据库smallint）
export type AchievementStatusCode = 0 | 1 | 2 | 3;

// 状态映射：字符串 -> 数字
export const STATUS_TO_NUMBER: Record<AchievementStatus, AchievementStatusCode> = {
  'draft': 0,
  'pending': 1,
  'approved': 2,
  'rejected': 3
};

// 状态映射：数字 -> 字符串
export const NUMBER_TO_STATUS: Record<AchievementStatusCode, AchievementStatus> = {
  0: 'draft',
  1: 'pending',
  2: 'approved',
  3: 'rejected'
};



// 成果信息（数据库版本 - status为数字）
export interface AchievementDB {
  id: string;
  title: string;
  description: string;
  type_id: string;
  cover_url: string;
  video_url: string;
  status: AchievementStatusCode;
  score?: number;
  publisher_id: string;
  instructor_id: string;
  parents_id?: string;
  created_at: string;
  updated_at?: string;
}

// 成果信息（应用版本 - status为字符串）
export interface Achievement {
  id: string;
  title: string;
  description: string;
  type_id: string;
  cover_url: string;
  video_url: string;
  status: AchievementStatus;
  score?: number;
  publisher_id: string;
  instructor_id: string;
  parents_id?: string;
  created_at: string;
  updated_at?: string;
  attachments?: AchievementAttachment[];
}

// 创建成果的请求数据
export interface CreateAchievementRequest {
  title: string;
  description: string;
  type_id: string;
  cover_url?: string;
  video_url?: string;
  publisher_id: string;
  instructor_id: string;
  parents_id?: string | null;
}

// 更新成果的请求数据
export interface UpdateAchievementRequest extends Partial<CreateAchievementRequest> {
  status?: AchievementStatus | AchievementStatusCode;
  score?: number;
  updated_at?: string;
}

// 用户信息（用于选择器）
export interface User {
  id: string;
  username: string;
  full_name?: string;
  email: string;
  role: number;
  created_at: string;
}

// 成果附件
export interface AchievementAttachment {
  id: string;
  achievement_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

// 成果类型选项
export const ACHIEVEMENT_TYPES: AchievementType[] = [
  { id: "0cc2c0c3-00ec-4d9c-a8f3-f92f77189efb", name: "其他", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "3582cb28-b452-4495-bd5c-85ea0a2a575f", name: "网站开发", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "71010940-a9e7-493c-a785-af6efb2948c0", name: "数据分析", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "814df843-11f4-4a70-8e4f-2ba79a8ca360", name: "游戏开发", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "9586ab13-63e6-43a8-8cb4-ee9d8db7bcfb", name: "移动应用", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "9d05e374-6741-4575-9cf7-bce4e0d20849", name: "办公应用", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "b962ef93-2b74-4499-a0be-3e4b0b6d6841", name: "创意作品", created_at: "2025-11-21 02:41:11.193907+00" },
  { id: "e0a8ff2d-7b61-4e4b-959e-7a0f4d89429d", name: "人工智能", created_at: "2025-11-21 02:41:11.193907+00" }
];

// 成果状态映射
export const ACHIEVEMENT_STATUS_MAP: Record<AchievementStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝'
};

// 审批操作结果
export interface ApprovalResult {
  success: boolean;
  message: string;
}

// 审批请求参数
export interface ApprovalRequest {
  id: string;
  action: 'approve' | 'reject';
  score?: number;
  reject_reason?: string;
  reviewer_id: string;
}

// 扩展的成果信息（包含关联用户信息）
export interface AchievementWithUsers extends Achievement {
  publisher: {
    id: string;
    username: string;
    email: string;
  };
  instructor?: {
    id: string;
    username: string;
    email: string;
  };
  parent?: {
    id: string;
    username: string;
    email: string;
  };
  type?: {
    id: string;
    name: string;
  };
}

// 审批筛选条件
export interface ApprovalFilters {
  class_id?: string;
  type_id?: string;
  title?: string;
  student_name?: string;
  status?: AchievementStatus;
  page?: number;
  limit?: number;
}

// 审批统计信息
export interface ApprovalStats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_count: number;
}