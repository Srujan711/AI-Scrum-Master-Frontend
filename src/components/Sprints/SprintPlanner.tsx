import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTeamStore } from '../../stores/teamStore';
import { Sprint, BacklogItem } from '../../types';
import { sprintApi, backlogApi } from '../../services/api';

interface SprintFormData {
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  planned_capacity?: number;
}

export const SprintPlanner: React.FC = () => {
  const { currentTeam, currentSprint, setCurrentSprint } = useTeamStore();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SprintFormData>();

  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['sprints', currentTeam?.id],
    queryFn: () => sprintApi.getSprints(currentTeam!.id),
    enabled: !!currentTeam,
  });

  const { data: availableItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['backlog', currentTeam?.id, 'unassigned'],
    queryFn: () => backlogApi.getUnassignedItems(currentTeam!.id),
    enabled: !!currentTeam,
  });

  const createSprintMutation = useMutation({
    mutationFn: sprintApi.createSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setShowCreateForm(false);
      reset();
    },
  });

  const addItemsToSprintMutation = useMutation({
    mutationFn: ({ sprintId, itemIds }: { sprintId: number; itemIds: number[] }) =>
      sprintApi.addItemsToSprint(sprintId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      setSelectedItems([]);
    },
  });

  const startSprintMutation = useMutation({
    mutationFn: sprintApi.startSprint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      setCurrentSprint(data);
    },
  });

  const onSubmit = (data: SprintFormData) => {
    if (!currentTeam) return;

    createSprintMutation.mutate({
      ...data,
      team_id: currentTeam.id,
      status: 'planning' as const,
    });
  };

  const handleAddItemsToSprint = (sprintId: number) => {
    if (selectedItems.length > 0) {
      addItemsToSprintMutation.mutate({ sprintId, itemIds: selectedItems });
    }
  };

  const handleStartSprint = (sprintId: number) => {
    startSprintMutation.mutate(sprintId);
  };

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: BacklogItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentTeam) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a team to plan sprints.</p>
        </div>
      </div>
    );
  }

  if (sprintsLoading) {
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
            <h2 className="text-lg font-semibold text-gray-900">Sprint Planning</h2>
            <p className="text-gray-600 mt-1">
              Plan and manage your team's sprints
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Sprint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprints List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprints</h3>
          <div className="space-y-4">
            {sprints.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No sprints found. Create your first sprint to get started.
              </p>
            ) : (
              sprints.map((sprint) => (
                <div key={sprint.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{sprint.name}</h4>
                      {sprint.goal && (
                        <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status)}`}>
                          {sprint.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                        </span>
                        {sprint.completed_points > 0 && (
                          <span className="text-sm text-gray-600">
                            {sprint.completed_points} points completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {sprint.status === 'planning' && (
                        <>
                          <button
                            onClick={() => handleAddItemsToSprint(sprint.id)}
                            disabled={selectedItems.length === 0 || addItemsToSprintMutation.isPending}
                            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Add Items
                          </button>
                          <button
                            onClick={() => handleStartSprint(sprint.id)}
                            disabled={startSprintMutation.isPending}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Start Sprint
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* AI Insights */}
                  {sprint.ai_insights && Object.keys(sprint.ai_insights).length > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-md">
                      <h5 className="text-sm font-medium text-purple-900 mb-2">AI Insights</h5>
                      <div className="text-sm text-purple-800">
                        {sprint.ai_insights.recommendations && (
                          <p>{sprint.ai_insights.recommendations}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {sprint.risk_factors && sprint.risk_factors.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Risk Factors</h5>
                      <div className="flex flex-wrap gap-1">
                        {sprint.risk_factors.map((risk, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Backlog Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Backlog Items
            {selectedItems.length > 0 && (
              <span className="ml-2 text-sm text-blue-600">
                ({selectedItems.length} selected)
              </span>
            )}
          </h3>
          {itemsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No unassigned backlog items available.
                </p>
              ) : (
                availableItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        {item.story_points && (
                          <span className="text-xs text-gray-600">
                            {item.story_points}pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Sprint</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sprint Name</label>
                  <input
                    {...register('name', { required: 'Sprint name is required' })}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sprint Goal (Optional)</label>
                  <textarea
                    {...register('goal')}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      {...register('start_date', { required: 'Start date is required' })}
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      {...register('end_date', { required: 'End date is required' })}
                      type="date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Planned Capacity (Optional)</label>
                  <input
                    {...register('planned_capacity', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSprintMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createSprintMutation.isPending ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};