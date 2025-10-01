import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { standupApi } from '../../services/api';
import { useTeamStore } from '../../stores/teamStore';
import { StandupSummary } from '../../types';

interface StandupFormData {
  date: string;
  manual_input?: {
    completed_yesterday: string[];
    planned_today: string[];
    blockers: string[];
  };
}

export const StandupGenerator: React.FC = () => {
  const { currentTeam, currentSprint } = useTeamStore();
  const queryClient = useQueryClient();
  const [generatedStandup, setGeneratedStandup] = useState<StandupSummary | null>(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<StandupFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const generateMutation = useMutation({
    mutationFn: standupApi.generateSummary,
    onSuccess: (data) => {
      setGeneratedStandup(data);
      queryClient.invalidateQueries({ queryKey: ['standups'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: standupApi.approveStandup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standups'] });
    },
  });

  const postToSlackMutation = useMutation({
    mutationFn: standupApi.postToSlack,
  });

  const onSubmit = (data: StandupFormData) => {
    if (!currentTeam) return;

    generateMutation.mutate({
      team_id: currentTeam.id,
      sprint_id: currentSprint?.id,
      date: data.date,
      manual_input: data.manual_input,
    });
  };

  const handleApprove = () => {
    if (generatedStandup) {
      approveMutation.mutate(generatedStandup.id);
    }
  };

  const handlePostToSlack = () => {
    if (generatedStandup) {
      postToSlackMutation.mutate(generatedStandup.id);
    }
  };

  if (!currentTeam) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a team to generate standups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Standup Summary</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Completed Yesterday (Optional)
              </label>
              <textarea
                placeholder="Add manual updates if needed..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Planned Today (Optional)
              </label>
              <textarea
                placeholder="Add planned work if needed..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blockers (Optional)
              </label>
              <textarea
                placeholder="Add known blockers..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Standup'}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Standup */}
      {generatedStandup && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Standup Summary</h3>
            <div className="flex space-x-2">
              {!generatedStandup.human_approved && (
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </button>
              )}
              <button
                onClick={handlePostToSlack}
                disabled={postToSlackMutation.isPending || !generatedStandup.human_approved}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                {postToSlackMutation.isPending ? 'Posting...' : 'Post to Slack'}
              </button>
            </div>
          </div>

          <div className="prose max-w-none">
            <div 
              className="whitespace-pre-wrap text-gray-800"
              dangerouslySetInnerHTML={{ __html: generatedStandup.summary_text }}
            />
          </div>

          {/* Action Items */}
          {generatedStandup.action_items && generatedStandup.action_items.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
              <div className="space-y-2">
                {generatedStandup.action_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.description}</p>
                      {item.assignee && (
                        <p className="text-xs text-gray-600">Assigned to: {item.assignee}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                generatedStandup.ai_generated ? 'bg-blue-400' : 'bg-gray-400'
              }`} />
              AI Generated
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                generatedStandup.human_approved ? 'bg-green-400' : 'bg-yellow-400'
              }`} />
              {generatedStandup.human_approved ? 'Approved' : 'Pending Approval'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};