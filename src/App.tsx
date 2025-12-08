import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApprovalProvider } from './contexts/ApprovalContext';
import appRouter from './router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ApprovalProvider>
        <RouterProvider router={appRouter} />
      </ApprovalProvider>
    </AuthProvider>
  );
};

export default App;