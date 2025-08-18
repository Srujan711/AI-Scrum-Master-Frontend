import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { standupApi } from '../../services/api';
import { StandupSummary } from '../../types';

interface RecentStandupsProps {
  teamId?: number;
}

export const RecentStandups: React.FC<RecentStandupsProps> = ({ teamId }) => {
  const { data: standups = [], isLoading } = useQuery({
    queryKey: ['standups', 'recent', teamId],
    queryFn: () => standupApi.getRecentStandups(teamId!),
    enabled: !!teamId,
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Standups</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Standups</h3>
        <span className="text-sm text-gray-500">{standups.length} summaries</span>
      </div>

      {standups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recent standups found.</p>
          <p className="text-sm text-gray-400 mt-1">Generate your first standup to see summaries here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {standups.slice(0, 5).map((standup: StandupSummary) => (
            <div key={standup.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(standup.date).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      {standup.ai_generated && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          AI Generated
                        </span>
                      )}
                      {standup.human_approved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {standup.summary_text.length > 150 
                      ? `${standup.summary_text.substring(0, 150)}...`
                      : standup.summary_text
                    }
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                    <span>{standup.completed_yesterday.length} completed</span>
                    <span>{standup.planned_today.length} planned</span>
                    {standup.blockers.length > 0 && (
                      <span className="text-red-600">{standup.blockers.length} blockers</span>
                    )}
                    {standup.action_items.length > 0 && (
                      <span className="text-orange-600">{standup.action_items.length} action items</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Items Preview */}
              {standup.action_items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Action Items</h5>
                  <div className="space-y-1">
                    {standup.action_items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          item.priority === 'high' ? 'bg-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}></span>
                        <span className="line-clamp-1">{item.description}</span>
                      </div>
                    ))}
                    {standup.action_items.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{standup.action_items.length - 2} more action items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {standups.length > 5 && (
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all standups
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};