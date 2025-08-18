import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';

interface AIInsightsProps {
  teamId?: number;
}

interface Insight {
  type: 'productivity' | 'risk' | 'suggestion' | 'celebration';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  related_items?: string[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ teamId }) => {
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights', teamId],
    queryFn: () => dashboardApi.getAIInsights(teamId!),
    enabled: !!teamId,
  });

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'productivity': return '📈';
      case 'risk': return '⚠️';
      case 'suggestion': return '💡';
      case 'celebration': return '🎉';
      default: return '🤖';
    }
  };

  const getInsightColor = (type: Insight['type'], severity: Insight['severity']) => {
    if (type === 'celebration') return 'bg-green-50 border-green-200 text-green-800';
    
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        <span className="text-sm text-gray-500">{insights.length} insights</span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-gray-500">No insights available yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            AI insights will appear here as your team generates more data.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight: Insight, index: number) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getInsightColor(insight.type, insight.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </span>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.severity}
                      </span>
                      {insight.actionable && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm mt-1 opacity-90">
                    {insight.description}
                  </p>

                  {insight.related_items && insight.related_items.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1">Related Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.related_items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View detailed AI analysis
            </button>
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span>AI Analysis Active</span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};