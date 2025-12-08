import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AchievementService } from '../lib/achievementService';

interface ApprovalContextType {
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
  setPendingCount: (count: number) => void;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const useApproval = () => {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
};

interface ApprovalProviderProps {
  children: ReactNode;
}

export const ApprovalProvider: React.FC<ApprovalProviderProps> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState<number>(0);

  // 刷新待审批数量
  const refreshPendingCount = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.id) {
          const result = await AchievementService.getPendingAchievementsCount(String(user.id));
          if (result.success && result.data !== undefined) {
            setPendingCount(result.data);
            console.log('🔄 ApprovalContext刷新待审批数量:', result.data);
          } else {
            console.warn('获取待审批数量失败:', result.message);
            setPendingCount(0);
          }
        }
      }
    } catch (error) {
      console.error('刷新待审批数量失败:', error);
      setPendingCount(0);
    }
  };

  // 页面加载时初始化一次
  useEffect(() => {
    refreshPendingCount();
  }, []);

  const value = {
    pendingCount,
    refreshPendingCount,
    setPendingCount,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
};