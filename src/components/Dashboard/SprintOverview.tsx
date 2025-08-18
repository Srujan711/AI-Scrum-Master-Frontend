import React from 'react';
import { Sprint } from '../../types';
import { BurndownChart } from '../Charts/BurndownChart';

interface Props {
  sprint: Sprint | null;
}

export const SprintOverview: React.FC<Props> = ({ sprint }) => {
  if (!sprint) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Overview</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No active sprint</p>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Start New Sprint
          </button>
        </div>
      </div>
    );
  }

  const progress = sprint.planned_capacity 
    ? (sprint.completed_points / sprint.planned_capacity) * 100 
    : 0;

  const daysRemaining = Math.ceil(
    (new Date(sprint.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Sprint Overview</h2>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          sprint.status === 'active' ? 'bg-green-100 text-green-800' :
          sprint.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Sprint Info */}
        <div>
          <h3 className="font-medium text-gray-900">{sprint.name}</h3>
          {sprint.goal && (
            <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{sprint.completed_points} / {sprint.planned_capacity} points</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{progress.toFixed(1)}% complete</span>
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>

        {/* Burndown Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Burndown Chart</h4>
          <BurndownChart sprintId={sprint.id} />
        </div>

        {/* Risk Factors */}
        {sprint.risk_factors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Factors</h4>
            <div className="space-y-1">
              {sprint.risk_factors.map((risk, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                  <span className="text-gray-600">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
