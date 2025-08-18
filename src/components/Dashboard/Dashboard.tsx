import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { SprintOverview } from './SprintOverview';
import { RecentStandups } from './RecentStandups';
import { AIInsights } from './AIInsights';
import { QuickActions } from './QuickActions';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currentTeam, currentSprint } = useTeamStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        // This would typically load team and sprint data
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-gray-600 mt-1">
          {currentTeam ? `Team: ${currentTeam.name}` : 'No team selected'}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Overview */}
        <div className="lg:col-span-1">
          <SprintOverview sprint={currentSprint} />
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-1">
          <AIInsights teamId={currentTeam?.id} />
        </div>
      </div>

      {/* Recent Standups */}
      <div className="grid grid-cols-1 gap-6">
        <RecentStandups teamId={currentTeam?.id} />
      </div>
    </div>
  );
};
