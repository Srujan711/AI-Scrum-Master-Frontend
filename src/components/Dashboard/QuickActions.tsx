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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`p-5 rounded-lg border-2 transition-all duration-200 text-left ${
                action.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md'
              } ${getColorClasses(action.color, action.disabled)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-6 h-6" />
                <div className={`w-2 h-2 rounded-full ${action.disabled ? 'bg-gray-300' : 'bg-current opacity-30'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};