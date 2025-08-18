import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTeamStore } from '../../stores/teamStore';
import { BacklogItem } from '../../types';
import { backlogApi } from '../../services/api';

export const BacklogManager: React.FC = () => {
  const { currentTeam, currentSprint } = useTeamStore();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: backlogItems = [], isLoading } = useQuery({
    queryKey: ['backlog', currentTeam?.id],
    queryFn: () => backlogApi.getBacklogItems(currentTeam!.id),
    enabled: !!currentTeam,
  });

  const createItemMutation = useMutation({
    mutationFn: backlogApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      setShowCreateForm(false);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<BacklogItem> }) =>
      backlogApi.updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });

  const aiAnalysisMutation = useMutation({
    mutationFn: backlogApi.analyzeItems,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });

  const handleStatusChange = (itemId: number, status: BacklogItem['status']) => {
    updateItemMutation.mutate({ id: itemId, updates: { status } });
  };

  const handlePriorityChange = (itemId: number, priority: BacklogItem['priority']) => {
    updateItemMutation.mutate({ id: itemId, updates: { priority } });
  };

  const handleAIAnalysis = () => {
    if (selectedItems.length > 0 && currentTeam) {
      aiAnalysisMutation.mutate({
        team_id: currentTeam.id,
        item_ids: selectedItems,
      });
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

  const getStatusColor = (status: BacklogItem['status']) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentTeam) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a team to manage backlog items.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
            <h2 className="text-lg font-semibold text-gray-900">Backlog Management</h2>
            <p className="text-gray-600 mt-1">
              Manage and prioritize your team's backlog items
            </p>
          </div>
          <div className="flex space-x-3">
            {selectedItems.length > 0 && (
              <button
                onClick={handleAIAnalysis}
                disabled={aiAnalysisMutation.isPending}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {aiAnalysisMutation.isPending ? 'Analyzing...' : 'AI Analysis'}
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Item
            </button>
          </div>
        </div>
      </div>

      {/* Backlog Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {backlogItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No backlog items found. Create your first item to get started.
            </div>
          ) : (
            backlogItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
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
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                        {item.jira_key && (
                          <span className="ml-2 text-sm text-gray-500">({item.jira_key})</span>
                        )}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.story_points && (
                          <span className="text-sm text-gray-600">
                            {item.story_points} points
                          </span>
                        )}
                        {item.clarity_score && (
                          <span className="text-sm text-gray-600">
                            Clarity: {Math.round(item.clarity_score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={item.priority}
                      onChange={(e) => handlePriorityChange(item.id, e.target.value as BacklogItem['priority'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as BacklogItem['status'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="to_do">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                {/* AI Suggestions */}
                {item.ai_suggestions && Object.keys(item.ai_suggestions).length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">AI Suggestions</h4>
                    <div className="text-sm text-blue-800">
                      {item.ai_suggestions.recommendations && (
                        <p>{item.ai_suggestions.recommendations}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Item Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Backlog Item</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createItemMutation.mutate({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                priority: formData.get('priority') as BacklogItem['priority'],
                team_id: currentTeam!.id,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createItemMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};