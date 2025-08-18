import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StandupGenerator } from './components/Standups/StandupGenerator';
import { BacklogManager } from './components/Backlog/BacklogManager';
import { SprintPlanner } from './components/Sprints/SprintPlanner';
import { IntegrationSettings } from './components/Settings/IntegrationSettings';
import { LoginPage } from './components/Auth/LoginPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          {!isAuthenticated ? (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/standups/generate" element={<StandupGenerator />} />
                <Route path="/backlog" element={<BacklogManager />} />
                <Route path="/sprints/plan" element={<SprintPlanner />} />
                <Route path="/settings/integrations" element={<IntegrationSettings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          )}
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;