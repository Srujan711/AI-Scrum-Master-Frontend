import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { SprintOverview } from './SprintOverview';
import { RecentStandups } from './RecentStandups';
import { AIInsights } from './AIInsights';
import { QuickActions } from './QuickActions';
import { useSprint } from '../../hooks/useSprints';
import { useTeamMetrics } from '../../hooks/useDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currentTeam, currentSprint: currentSprintFromStore } = useTeamStore();

  // Fetch sprint data if we have a current sprint ID
  const { data: sprintData, isLoading: sprintLoading } = useSprint(currentSprintFromStore?.id);
  const { data: metrics, isLoading: metricsLoading } = useTeamMetrics(currentTeam?.id);

  const currentSprint = sprintData || currentSprintFromStore;
  const loading = sprintLoading || metricsLoading;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTeam ? `Team: ${currentTeam.name}` : 'No team selected'}
            </p>
          </div>
          {metrics && (
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.total_sprints || 0}</div>
                <div className="text-gray-500">Sprints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.completed_points || 0}</div>
                <div className="text-gray-500">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.avg_velocity?.toFixed(1) || '0'}</div>
                <div className="text-gray-500">Velocity</div>
              </div>
            </div>
          )}
        </div>
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
