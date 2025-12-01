import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import appRouter from './router';
import AuthDebug from './components/AuthDebug';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter} />
      <AuthDebug />
    </AuthProvider>
  );
};

export default App;