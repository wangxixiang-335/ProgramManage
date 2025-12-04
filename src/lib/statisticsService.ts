import { supabase } from './supabase';
import { getCurrentUser } from './userUtils';

export interface StatisticsData {
  publicationByType: {
    labels: string[];
    data: number[];
  };
  scoreTrend: {
    labels: string[];
    scores: number[];
  };
  studentPublications: {
    excellent: number[];
    good: number[];
    average: number[];
    pass: number[];
    labels: string[];
  };
  studentStats?: {
    totalProjects: number;
    averageScore: number;
    completionRate: number;
  };
}

export class StatisticsService {
  // 获取学生统计数据
  static async getStudentStatistics(): Promise<StatisticsData> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      const userId = currentUser.id;
      // 获取学生的所有成果
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select(`
          score, 
          status, 
          achievement_types!achievements_type_id_fkey(name), 
          created_at
        `)
        .eq('publisher_id', userId);

      if (achievementsError) throw achievementsError;

      // 计算统计数据
      const totalProjects = achievements?.length || 0; // 参与项目总数 = 发布的所有成果数量
      // 处理状态可能是数字或字符串的情况
      const passedProjects = achievements?.filter(a => a.status === 2 || a.status === 'approved')?.length || 0; // 2 = approved 或 'approved'
      const passedScores = achievements?.filter(a => (a.status === 2 || a.status === 'approved') && a.score !== null)?.map(a => a.score) || [];
      const totalScore = passedScores.reduce((sum, score) => sum + score, 0);
      // 平均成绩 = 通过的项目的分数和除以通过的成果数量（不是总成果数量）
      const averageScore = passedProjects > 0 ? totalScore / passedProjects : 0;
      // 项目完成率 = 通过的项目数量除以该学生发布的所有成果的数量
      const completionRate = totalProjects > 0 ? (passedProjects / totalProjects) * 100 : 0;

      // 统计各类型的数量
      const typeCount: { [key: string]: number } = {};
      achievements?.forEach(achievement => {
        const typeName = achievement.achievement_types?.name || '未分类';
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });

      // 准备发布量统计数据
      const typeLabels = Object.keys(typeCount);
      const typeData = Object.values(typeCount);

      // 准备成绩趋势数据（按时间排序）- 只包含已通过的成果
      const scoreData = achievements
        ?.filter(a => (a.status === 2 || a.status === 'approved') && a.score !== null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((a, index) => ({
          score: a.score!,
          label: `第${index + 1}次`
        })) || [];

      console.log('📈 成绩趋势数据详情:', {
        原始成果数量: achievements?.length || 0,
        通过审核的成果数量: passedProjects,
        有分数的成果数量: scoreData.length,
        成绩数据: scoreData.map(d => ({ 标签: d.label, 分数: d.score }))
      });

      console.log('📊 计算出的统计数据:', {
        totalProjects,
        passedProjects,
        averageScore,
        completionRate,
        typeCount: typeLabels.length,
        scoreDataPoints: scoreData.length
      });

      return {
        publicationByType: {
          labels: typeLabels,
          data: typeData
        },
        scoreTrend: {
          labels: scoreData.map(d => d.label),
          scores: scoreData.map(d => d.score)
        },
        studentPublications: {
          excellent: [],
          good: [],
          average: [],
          pass: [],
          labels: []
        },
        studentStats: {
          totalProjects,
          averageScore: Math.round(averageScore * 100) / 100, // 保留两位小数
          completionRate: Math.round(completionRate * 100) / 100 // 保留两位小数
        }
      };
    } catch (error) {
      console.error('获取学生统计数据失败:', error);
      // 返回默认数据
      return {
        publicationByType: {
          labels: ['项目报告', '论文', '软件作品', '实验报告', '其他'],
          data: [0, 0, 0, 0, 0]
        },
        scoreTrend: {
          labels: ['第1次', '第2次', '第3次'],
          scores: [0, 0, 0]
        },
        studentPublications: {
          excellent: [],
          good: [],
          average: [],
          pass: [],
          labels: []
        },
        studentStats: {
          totalProjects: 0,
          averageScore: 0,
          completionRate: 0
        }
      };
    }
  }

  // 获取教师统计数据
  static async getTeacherStatistics(): Promise<StatisticsData> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      // 从数据库获取真实的成果类型
      const { data: achievementTypes, error: typesError } = await supabase
        .from('achievement_types')
        .select('*')
        .order('created_at');

      if (typesError) {
        console.error('获取成果类型失败:', typesError);
        throw typesError;
      }

      const typeLabels = achievementTypes?.map(type => type.name) || [];
      const typeData = new Array(typeLabels.length).fill(0);
      
      // 获取教师自己的发布统计（按类型）
      const { data: teacherAchievements, error: teacherError } = await supabase
        .from('achievements')
        .select('type_id')
        .eq('publisher_id', currentUser.id)
        .eq('status', 2); // 只统计已通过的成果

      if (teacherError) {
        console.error('获取教师发布统计失败:', teacherError);
        throw teacherError;
      }

      // 统计各类型数量
      teacherAchievements?.forEach(achievement => {
        const typeIndex = achievementTypes?.findIndex(type => type.id === achievement.type_id);
        if (typeIndex !== -1 && typeIndex !== undefined) {
          typeData[typeIndex]++;
        }
      });

      // 获取教师指导学生的成绩统计
      const studentStats = await this.getTeacherStudentStats(currentUser.id);

      return {
        publicationByType: {
          labels: typeLabels,
          data: typeData
        },
        scoreTrend: {
          labels: [],
          scores: []
        },
        studentPublications: studentStats
      };
    } catch (error) {
      console.error('获取教师统计数据失败:', error);
      
      // 如果数据库查询失败，使用预定义的ACHIEVEMENT_TYPES作为fallback
      const { ACHIEVEMENT_TYPES } = await import('../types/achievement');
      const fallbackLabels = ACHIEVEMENT_TYPES.map(type => type.name);
      
      // 返回默认数据
      return {
        publicationByType: {
          labels: fallbackLabels,
          data: new Array(fallbackLabels.length).fill(0)
        },
        scoreTrend: {
          labels: [],
          scores: []
        },
        studentPublications: {
          excellent: new Array(fallbackLabels.length).fill(0),
          good: new Array(fallbackLabels.length).fill(0),
          average: new Array(fallbackLabels.length).fill(0),
          pass: new Array(fallbackLabels.length).fill(0),
          labels: fallbackLabels
        }
      };
    }
  }

  // 获取实际数据库中的学生发布统计
  static async getStudentPublicationStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_types(name)')
        .eq('publisher_id', userId);

      if (error) throw error;

      // 统计各类型的数量
      const typeCount: { [key: string]: number } = {};
      data?.forEach(achievement => {
        const typeName = achievement.achievement_types?.name || '未分类';
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });

      return typeCount;
    } catch (error) {
      console.error('获取学生发布统计失败:', error);
      return {};
    }
  }

  // 获取学生的成绩趋势
  static async getStudentScoreTrend(userId: string) {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('score, created_at')
        .eq('publisher_id', userId)
        .not('score', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(item => ({
        score: item.score,
        date: item.created_at
      })) || [];
    } catch (error) {
      console.error('获取学生成绩趋势失败:', error);
      return [];
    }
  }

  // 获取教师看板统计数据
  static async getTeacherDashboardStats(teacherId: string): Promise<{
    pendingCount: number;     // 待审批成果数量
    publishedCount: number;    // 已发布成果数量
    studentCount: number;      // 指导学生数量
    projectCount: number;      // 负责项目数量
  }> {
    try {
      // 获取待审批成果数量 - 只统计该教师指导学生的待审批成果
      const { data: pendingAchievements, error: pendingError } = await supabase
        .from('achievements')
        .select('id')
        .eq('instructor_id', teacherId)
        .eq('status', 1); // 1 = pending (STATUS_TO_NUMBER['pending'])

      if (pendingError) throw pendingError;
      const pendingCount = pendingAchievements?.length || 0;

      // 获取已发布成果数量 - 统计该教师发布的成果
      const { data: publishedAchievements, error: publishedError } = await supabase
        .from('achievements')
        .select('id')
        .eq('publisher_id', teacherId)
        .eq('status', 2); // 2 = 已通过/approved

      if (publishedError) throw publishedError;
      const publishedCount = publishedAchievements?.length || 0;

      // 获取指导学生数量 - 通过achievements表统计该教师指导的不同学生数量
      const { data: studentAchievements, error: studentsError } = await supabase
        .from('achievements')
        .select('publisher_id')
        .eq('instructor_id', teacherId);

      if (studentsError) throw studentsError;
      
      // 统计不重复的学生ID
      const uniqueStudentIds = new Set(studentAchievements?.map(item => item.publisher_id) || []);
      const studentCount = uniqueStudentIds.size;

      // 获取负责项目数量 - 统计该教师作为指导老师的所有项目（成果）
      const { data: projects, error: projectsError } = await supabase
        .from('achievements')
        .select('id')
        .eq('instructor_id', teacherId);

      if (projectsError) throw projectsError;
      const projectCount = projects?.length || 0;

      return {
        pendingCount,
        publishedCount,
        studentCount,
        projectCount
      };
    } catch (error) {
      console.error('获取教师看板统计数据失败:', error);
      return {
        pendingCount: 0,
        publishedCount: 0,
        studentCount: 0,
        projectCount: 0
      };
    }
  }

  // 获取教师指导学生的发布统计
  static async getTeacherStudentStats(teacherId: string) {
    try {
      // 首先获取该教师指导的学生
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 1); // 学生

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        return { excellent: [], good: [], average: [], pass: [], labels: [] };
      }

      const studentIds = students.map(s => s.id);

      // 获取这些学生的成果
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('score, achievement_types(name)')
        .in('publisher_id', studentIds)
        .not('score', 'is', null);

      if (achievementsError) throw achievementsError;

      // 按类型和分数段统计
      const stats: { [type: string]: { excellent: number; good: number; average: number; pass: number } } = {};
      
      achievements?.forEach(achievement => {
        const typeName = achievement.achievement_types?.name || '未分类';
        if (!stats[typeName]) {
          stats[typeName] = { excellent: 0, good: 0, average: 0, pass: 0 };
        }

        const score = achievement.score || 0;
        if (score >= 90) stats[typeName].excellent++;
        else if (score >= 80) stats[typeName].good++;
        else if (score >= 70) stats[typeName].average++;
        else if (score >= 60) stats[typeName].pass++;
      });

      const labels = Object.keys(stats);
      return {
        excellent: labels.map(label => stats[label]?.excellent || 0),
        good: labels.map(label => stats[label]?.good || 0),
        average: labels.map(label => stats[label]?.average || 0),
        pass: labels.map(label => stats[label]?.pass || 0),
        labels
      };
    } catch (error) {
      console.error('获取教师学生统计失败:', error);
      return { excellent: [], good: [], average: [], pass: [], labels: [] };
    }
  }
}

export default StatisticsService;