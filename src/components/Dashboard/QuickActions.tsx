import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamStore } from '../../stores/teamStore';
import { MessageSquare, Target, Rocket, BarChart3 } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { currentTeam } = useTeamStore();

  const actions = [
    {
      title: 'Generate Standup',
      description: 'Create AI-powered standup summary',
      icon: MessageSquare,
      color: 'blue',
      onClick: () => navigate('/standups/generate'),
      disabled: !currentTeam,
    },
    {
      title: 'Analyze Backlog',
      description: 'Run AI analysis on backlog items',
      icon: Target,
      color: 'purple',
      onClick: () => navigate('/backlog/analyze'),
      disabled: !currentTeam,
    },
    {
      title: 'Plan Sprint',
      description: 'Create new sprint with AI recommendations',
      icon: Rocket,
      color: 'green',
      onClick: () => navigate('/sprints/plan'),
      disabled: !currentTeam,
    },
    {
      title: 'View Reports',
      description: 'Check team performance and insights',
      icon: BarChart3,
      color: 'orange',
      onClick: () => navigate('/reports'),
      disabled: !currentTeam,
    },
  ];

  const getColorClasses = (color: string, disabled: boolean) => {
    if (disabled) {
      return 'bg-gray-50 text-gray-400 border-gray-200';
    }

    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
    };

    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        {!currentTeam && (
          <span className="text-sm text-gray-500">Select a team to enable actions</span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                action.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0'
              } ${getColorClasses(action.color, action.disabled)}`}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2 rounded-lg ${action.disabled ? 'bg-gray-100' : 'bg-white bg-opacity-50'}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">{action.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{action.description}</p>
              {!action.disabled && (
                <div className="mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};