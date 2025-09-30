import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Calendar } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { standupApi } from '../../../services/api';
import { StandupSummary } from '../../../types';

interface Props {
  onNext: () => void;
  onBack: () => void;
  teamId: number;
}

export const GenerateFirstSummaryStep: React.FC<Props> = ({ onNext, onBack, teamId }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedSummary, setGeneratedSummary] = useState<StandupSummary | null>(null);

  const generateMutation = useMutation({
    mutationFn: () => standupApi.generateSummary({ team_id: teamId, date }),
    onSuccess: (data) => {
      setGeneratedSummary(data);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleComplete = () => {
    onNext();
  };

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your First Standup</h2>
        <p className="text-gray-600">
          Let's create your first AI-powered standup summary to see the magic in action
        </p>
      </div>

      {!generatedSummary ? (
        <div>
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Data Analysis</h4>
              <p className="text-xs text-gray-600">
                AI analyzes your team's activity and generates insights
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✍️</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Smart Summary</h4>
              <p className="text-xs text-gray-600">
                Creates organized summaries of work completed and planned
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">Action Items</h4>
              <p className="text-xs text-gray-600">
                Identifies blockers and suggests next steps
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold disabled:opacity-50 flex items-center justify-center mx-auto"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating AI Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Standup Summary
                </>
              )}
            </button>
            {generateMutation.isPending && (
              <p className="text-sm text-gray-500 mt-3">
                This may take 10-15 seconds...
              </p>
            )}
          </div>

          {generateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-800">
                Failed to generate summary. This might be because there's no data yet.
                Try importing data from integrations or adding some backlog items first.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Success State */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Summary Generated Successfully!</h3>
                <p className="text-sm text-green-700">Here's your first AI-powered standup summary</p>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(generatedSummary.date).toLocaleDateString()}
              </div>
              <div className="prose prose-sm max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: generatedSummary.summary_text }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                <span>{generatedSummary.completed_yesterday.length} completed</span>
                <span>{generatedSummary.planned_today.length} planned</span>
                {generatedSummary.blockers.length > 0 && (
                  <span className="text-red-600">{generatedSummary.blockers.length} blockers</span>
                )}
                <span className="text-purple-600">{generatedSummary.action_items.length} action items</span>
              </div>
            </div>
          </div>

          {/* Celebration */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
            <p className="text-gray-600">
              Your team is now ready to use AI Scrum Master. Let's get started!
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={generateMutation.isPending}
          className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        {generatedSummary && (
          <button
            onClick={handleComplete}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};