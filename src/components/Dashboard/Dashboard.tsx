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
      <div className="bg-white shadow-sm rounded-xl p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            {currentTeam ? `Team: ${currentTeam.name}` : 'No team selected'}
          </p>
        </div>
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:scale-105">
              <div className="text-4xl font-bold text-blue-600 mb-2">{metrics.total_sprints || 0}</div>
              <div className="text-sm font-semibold text-gray-700">Total Sprints</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:scale-105">
              <div className="text-4xl font-bold text-green-600 mb-2">{metrics.completed_points || 0}</div>
              <div className="text-sm font-semibold text-gray-700">Points Completed</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center transition-all hover:shadow-lg hover:scale-105">
              <div className="text-4xl font-bold text-purple-600 mb-2">{metrics.avg_velocity?.toFixed(1) || '0'}</div>
              <div className="text-sm font-semibold text-gray-700">Avg Velocity</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sprint Overview */}
        <SprintOverview sprint={currentSprint} />

        {/* AI Insights */}
        <AIInsights teamId={currentTeam?.id} />
      </div>

      {/* Recent Standups */}
      <RecentStandups teamId={currentTeam?.id} />
    </div>
  );
};
