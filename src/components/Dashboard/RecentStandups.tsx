import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { standupApi } from '../../services/api';
import { StandupSummary } from '../../types';
import { Calendar, CheckCircle, AlertTriangle, ListTodo, MessageSquare } from 'lucide-react';

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
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Standups</h3>
        <span className="text-sm text-gray-500">{standups.length} summaries</span>
      </div>

      {standups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No standups yet</p>
          <p className="text-sm text-gray-500 mb-4">Generate your first AI-powered standup summary</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Generate Standup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {standups.slice(0, 5).map((standup: StandupSummary) => (
            <div key={standup.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {new Date(standup.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {standup.ai_generated && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          AI Generated
                        </span>
                      )}
                      {standup.human_approved && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          ✓ Approved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {standup.summary_text.length > 150
                      ? `${standup.summary_text.substring(0, 150)}...`
                      : standup.summary_text
                    }
                  </div>

                  {/* Quick Stats with Icons */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
                    <div className="flex items-center space-x-1.5 text-green-600">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">{standup.completed_yesterday?.length || 0} completed</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-blue-600">
                      <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="font-medium">{standup.planned_today?.length || 0} planned</span>
                    </div>
                    {standup.blockers && standup.blockers.length > 0 && (
                      <div className="flex items-center space-x-1.5 text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="font-medium">{standup.blockers.length} blockers</span>
                      </div>
                    )}
                    {standup.action_items && standup.action_items.length > 0 && (
                      <span className="text-orange-600 font-medium">{standup.action_items.length} actions</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Items Preview */}
              {standup.action_items && standup.action_items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Action Items</h5>
                  <div className="space-y-2">
                    {standup.action_items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0 ${
                          item.priority === 'high' ? 'bg-red-500' :
                          item.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></span>
                        <span className="line-clamp-1 flex-1">{item.description}</span>
                      </div>
                    ))}
                    {standup.action_items.length > 2 && (
                      <div className="text-xs text-gray-500 ml-3.5">
                        +{standup.action_items.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {standups.length > 5 && (
            <div className="text-center pt-2">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                View all {standups.length} standups →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};