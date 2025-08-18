import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamStore } from '../../stores/teamStore';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { currentTeam } = useTeamStore();

  const actions = [
    {
      title: 'Generate Standup',
      description: 'Create AI-powered standup summary',
      icon: '📝',
      onClick: () => navigate('/standups/generate'),
      disabled: !currentTeam,
    },
    {
      title: 'Analyze Backlog',
      description: 'Run AI analysis on backlog items',
      icon: '🎯',
      onClick: () => navigate('/backlog/analyze'),
      disabled: !currentTeam,
    },
    {
      title: 'Plan Sprint',
      description: 'Create new sprint with AI recommendations',
      icon: '🚀',
      onClick: () => navigate('/sprints/plan'),
      disabled: !currentTeam,
    },
    {
      title: 'View Reports',
      description: 'Check team performance and insights',
      icon: '📊',
      onClick: () => navigate('/reports'),
      disabled: !currentTeam,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
              action.disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
            }`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};