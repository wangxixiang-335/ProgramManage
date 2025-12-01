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
      // 平均成绩 = 通过的项目的分数和除以该学生发布的所有成果的数量
      const averageScore = totalProjects > 0 ? totalScore / totalProjects : 0;
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

      // 准备成绩趋势数据（按时间排序）
      const scoreData = achievements
        ?.filter(a => a.score !== null)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((a, index) => ({
          score: a.score!,
          label: `第${index + 1}次`
        })) || [];

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

      // 模拟数据 - 在实际项目中应该从数据库获取
      const mockData: StatisticsData = {
        publicationByType: {
          labels: ['项目报告', '论文', '软件作品', '实验报告', '其他'],
          data: [35, 25, 20, 15, 5]
        },
        scoreTrend: {
          labels: [],
          scores: []
        },
        studentPublications: {
          excellent: [8, 5, 3, 1, 1],
          good: [10, 7, 3, 2, 0],
          average: [2, 1, 0, 0, 0],
          pass: [1, 1, 0, 0, 0],
          labels: ['项目报告', '论文', '软件作品', '实验报告', '其他']
        }
      };

      return mockData;
    } catch (error) {
      console.error('获取教师统计数据失败:', error);
      // 返回默认数据
      return {
        publicationByType: {
          labels: ['项目报告', '论文', '软件作品', '实验报告', '其他'],
          data: [0, 0, 0, 0, 0]
        },
        scoreTrend: {
          labels: [],
          scores: []
        },
        studentPublications: {
          excellent: [0, 0, 0, 0, 0],
          good: [0, 0, 0, 0, 0],
          average: [0, 0, 0, 0, 0],
          pass: [0, 0, 0, 0, 0],
          labels: ['项目报告', '论文', '软件作品', '实验报告', '其他']
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