import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

import P_login from '../pages/p-login';
import P_home from '../pages/p-home';
import P_project_intro from '../pages/p-project_intro';
import P_project_detail from '../pages/p-project_detail';
import P_business_process from '../pages/p-business_process';
import P_student_info from '../pages/p-student_info';
import P_personal_center from '../pages/p-personal_center';
import P_image_viewer from '../pages/p-image_viewer';
import P_change_password from '../pages/p-change_password';
import P_register from '../pages/p-register';
import P_forgot_password from '../pages/p-forgot_password';
import P_teacher_home from '../pages/p-teacher_home';
import P_achievement_approval from '../pages/p-achievement_approval';
import P_achievement_publish from '../pages/p-achievement_publish';
import P_achievement_edit from '../pages/p-achievement_edit';
import P_achievement_detail from '../pages/p-achievement_detail';
import P_achievement_management from '../pages/p-achievement_management';
import P_achievement_view from '../pages/p-achievement_view';
import P_admin_home from '../pages/p-admin_home';
import P_news_management from '../pages/p-news_management';
import P_achievement_library_management from '../pages/p-achievement_library_management';
import P_knowledge_base_management from '../pages/p-knowledge_base_management';
import P_carousel_management from '../pages/p-carousel_management';
import P_user_management from '../pages/p-user_management';
import NotFoundPage from './NotFoundPage';
import ErrorPage from './ErrorPage';

function Listener() {
  const location = useLocation();
  useEffect(() => {
    const pageId = 'P-' + location.pathname.replace('/', '').toUpperCase();
    console.log('当前pageId:', pageId, ', pathname:', location.pathname, ', search:', location.search);
    if (typeof window === 'object' && window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'chux-path-change',
        pageId: pageId,
        pathname: location.pathname,
        search: location.search,
      }, '*');
    }
  }, [location]);

  return <Outlet />;
}

// 使用 createBrowserRouter 创建路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Listener />,
    children: [
      {
    path: '/',
    element: <Navigate to='/login' replace={true} />,
  },
      {
    path: '/login',
    element: (
      <ErrorBoundary>
        <P_login />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/home',
    element: (
      <ErrorBoundary>
        <P_home />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/project-intro',
    element: (
      <ErrorBoundary>
        <P_project_intro />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/project-detail',
    element: (
      <ErrorBoundary>
        <P_project_detail />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/business-process',
    element: (
      <ErrorBoundary>
        <P_business_process />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/student-info',
    element: (
      <ErrorBoundary>
        <P_student_info />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/personal-center',
    element: (
      <ErrorBoundary>
        <P_personal_center />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/image-viewer',
    element: (
      <ErrorBoundary>
        <P_image_viewer />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/change-password',
    element: (
      <ErrorBoundary>
        <P_change_password />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/register',
    element: (
      <ErrorBoundary>
        <P_register />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/forgot-password',
    element: (
      <ErrorBoundary>
        <P_forgot_password />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/teacher-home',
    element: (
      <ErrorBoundary>
        <P_teacher_home />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-approval',
    element: (
      <ErrorBoundary>
        <P_achievement_approval />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-publish',
    element: (
      <ErrorBoundary>
        <P_achievement_publish />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-edit/:id',
    element: (
      <ErrorBoundary>
        <P_achievement_edit />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-detail',
    element: (
      <ErrorBoundary>
        <P_achievement_detail />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-management',
    element: (
      <ErrorBoundary>
        <P_achievement_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-view',
    element: (
      <ErrorBoundary>
        <P_achievement_view />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/admin-home',
    element: (
      <ErrorBoundary>
        <P_admin_home />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/news-management',
    element: (
      <ErrorBoundary>
        <P_news_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/achievement-library-management',
    element: (
      <ErrorBoundary>
        <P_achievement_library_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/knowledge-base-management',
    element: (
      <ErrorBoundary>
        <P_knowledge_base_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/carousel-management',
    element: (
      <ErrorBoundary>
        <P_carousel_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/user-management',
    element: (
      <ErrorBoundary>
        <P_user_management />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '*',
    element: <NotFoundPage />,
  },
    ]
  }
]);

export default router;