import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import appRouter from './router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  );
};

export default App;