import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { currentTeam } = useTeamStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Generate Standup', href: '/standups/generate', icon: '📝' },
    { name: 'Backlog', href: '/backlog', icon: '📋' },
    { name: 'Sprint Planning', href: '/sprints/plan', icon: '🎯' },
    { name: 'Integrations', href: '/settings/integrations', icon: '🔗' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">🤖 AI Scrum Master</h1>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              {currentTeam && (
                <div className="text-sm text-gray-600">
                  Team: <span className="font-medium">{currentTeam.name}</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {user?.full_name}
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation and Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <nav className="w-64 mr-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};