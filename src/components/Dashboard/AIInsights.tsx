import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';
import { TrendingUp, AlertTriangle, Lightbulb, PartyPopper, Sparkles } from 'lucide-react';

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
  const { data, isLoading } = useQuery({
    queryKey: ['ai-insights', teamId],
    queryFn: () => dashboardApi.getAIInsights(teamId!),
    enabled: !!teamId,
  });

  // Handle both array and object responses
  const insights = Array.isArray(data) ? data : (data?.insights || []);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5" />;
      case 'celebration': return <PartyPopper className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: Insight['type'], severity: Insight['severity']) => {
    if (type === 'celebration') return 'bg-green-50 border-l-4 border-l-green-500 text-green-900';
    if (type === 'suggestion') return 'bg-purple-50 border-l-4 border-l-purple-500 text-purple-900';

    switch (severity) {
      case 'high': return 'bg-red-50 border-l-4 border-l-red-500 text-red-900';
      case 'medium': return 'bg-yellow-50 border-l-4 border-l-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-900';
      default: return 'bg-gray-50 border-l-4 border-l-gray-500 text-gray-900';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
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
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Insights</h3>
        </div>
        <span className="text-sm text-gray-500">{insights.length} insights</span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-200">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No insights yet</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            AI insights will appear here as your team generates standups and completes work
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight: Insight, index: number) => (
            <div
              key={index}
              className={`rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${getInsightColor(insight.type, insight.severity)}`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <h4 className="font-semibold text-sm sm:text-base">{insight.title}</h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-700' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {insight.severity}
                      </span>
                      {insight.actionable && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          Action
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
                    {insight.description}
                  </p>

                  {insight.related_items && insight.related_items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-10">
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-70">Related Items</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.related_items.map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="px-2 py-1 bg-white bg-opacity-60 rounded-md text-xs font-medium"
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
            <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              View detailed analysis →
            </button>
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-gray-600 font-medium">AI Analysis Active</span>
          </div>
          <span className="text-gray-500">Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};