import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Download, Check, Loader } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { integrationApi } from '../../../services/api';

interface Props {
  onNext: (data: { dataImported?: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
  teamId?: number;
  hasIntegrations?: boolean;
}

export const ImportDataStep: React.FC<Props> = ({ onNext, onBack, onSkip, teamId, hasIntegrations }) => {
  const [importJira, setImportJira] = useState(false);
  const [importSlack, setImportSlack] = useState(false);
  const [jiraImportComplete, setJiraImportComplete] = useState(false);
  const [slackImportComplete, setSlackImportComplete] = useState(false);

  const jiraSyncMutation = useMutation({
    mutationFn: () => integrationApi.syncIntegration('jira', teamId!),
    onSuccess: () => {
      setJiraImportComplete(true);
    },
  });

  const slackSyncMutation = useMutation({
    mutationFn: () => integrationApi.syncIntegration('slack', teamId!),
    onSuccess: () => {
      setSlackImportComplete(true);
    },
  });

  const handleImport = async () => {
    const promises = [];

    if (importJira && teamId) {
      promises.push(jiraSyncMutation.mutateAsync());
    }

    if (importSlack && teamId) {
      promises.push(slackSyncMutation.mutateAsync());
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      onNext({ dataImported: true });
    } else {
      onNext({ dataImported: false });
    }
  };

  const isImporting = jiraSyncMutation.isPending || slackSyncMutation.isPending;
  const canImport = importJira || importSlack;

  if (!hasIntegrations) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Existing Data</h2>
          <p className="text-gray-600">No integrations connected yet</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Integrations</h3>
          <p className="text-gray-600 mb-6">
            You haven't connected any integrations yet. Go back to connect Jira or Slack,
            or continue to set up your team manually.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            onClick={() => onNext({ dataImported: false })}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Existing Data</h2>
        <p className="text-gray-600">
          Import your existing sprints, issues, and team data from connected integrations
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Jira Import Option */}
        <div className={`border rounded-lg p-6 ${importJira ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={importJira}
              onChange={(e) => setImportJira(e.target.checked)}
              disabled={jiraImportComplete}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Import from Jira</h3>
                {jiraImportComplete && (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Imported
                  </span>
                )}
                {jiraSyncMutation.isPending && (
                  <span className="flex items-center text-blue-600 text-sm">
                    <Loader className="w-4 h-4 mr-1 animate-spin" />
                    Importing...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                We'll import your existing sprint, backlog items, and issue history
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• Active and completed sprints</li>
                <li>• Backlog items with details</li>
                <li>• Issue status and assignments</li>
              </ul>
            </div>
          </label>
        </div>

        {/* Slack Import Option */}
        <div className={`border rounded-lg p-6 ${importSlack ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={importSlack}
              onChange={(e) => setImportSlack(e.target.checked)}
              disabled={slackImportComplete}
              className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Import from Slack</h3>
                {slackImportComplete && (
                  <span className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Imported
                  </span>
                )}
                {slackSyncMutation.isPending && (
                  <span className="flex items-center text-purple-600 text-sm">
                    <Loader className="w-4 h-4 mr-1 animate-spin" />
                    Importing...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                We'll import recent standup messages and team updates from the last 30 days
              </p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>• Recent standup messages</li>
                <li>• Team member updates</li>
                <li>• Channel activity history</li>
              </ul>
            </div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Initial import may take a few minutes depending on the amount of data.
          You can continue using the app while the import runs in the background.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isImporting}
          className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onSkip}
            disabled={isImporting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport || isImporting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                {canImport ? 'Import & Continue' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};