import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, ExternalLink, Check } from 'lucide-react';
import { integrationApi } from '../../../services/api';

interface Props {
  onNext: (data: { jiraConnected?: boolean; slackConnected?: boolean }) => void;
  onBack: () => void;
  onSkip: () => void;
  teamId?: number;
}

export const ConnectIntegrationsStep: React.FC<Props> = ({ onNext, onBack, onSkip, teamId }) => {
  const [jiraConnected, setJiraConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [connecting, setConnecting] = useState<'jira' | 'slack' | null>(null);

  const handleConnectJira = async () => {
    try {
      setConnecting('jira');
      const { auth_url } = await integrationApi.getJiraAuthUrl();
      // Open OAuth popup
      const popup = window.open(auth_url, 'Jira OAuth', 'width=600,height=700');

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'jira-oauth-success') {
          setJiraConnected(true);
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Failed to connect Jira:', error);
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectSlack = async () => {
    try {
      setConnecting('slack');
      const { auth_url } = await integrationApi.getSlackAuthUrl();
      // Open OAuth popup
      const popup = window.open(auth_url, 'Slack OAuth', 'width=600,height=700');

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'slack-oauth-success') {
          setSlackConnected(true);
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Failed to connect Slack:', error);
    } finally {
      setConnecting(null);
    }
  };

  const handleContinue = () => {
    onNext({ jiraConnected, slackConnected });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Tools</h2>
        <p className="text-gray-600">
          Connect your existing tools to import data and enable powerful integrations
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Jira Integration */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <img
                  src="https://cdn.worldvectorlogo.com/logos/jira-1.svg"
                  alt="Jira"
                  className="w-8 h-8"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Jira</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Import issues, sprints, and track progress automatically
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Sync backlog items and user stories
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Track sprint progress in real-time
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Get AI insights on issue clarity
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleConnectJira}
              disabled={jiraConnected || connecting === 'jira'}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                jiraConnected
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {jiraConnected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Connected
                </>
              ) : connecting === 'jira' ? (
                'Connecting...'
              ) : (
                <>
                  Connect
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Slack Integration */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <img
                  src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg"
                  alt="Slack"
                  className="w-8 h-8"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Slack</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Post standup summaries and get team updates automatically
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Auto-post standup summaries to channels
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Collect team updates via Slack messages
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Get notified about blockers and action items
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={handleConnectSlack}
              disabled={slackConnected || connecting === 'slack'}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                slackConnected
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {slackConnected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Connected
                </>
              ) : connecting === 'slack' ? (
                'Connecting...'
              ) : (
                <>
                  Connect
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You can skip this step and connect integrations later from Settings.
          However, connecting now will enable automatic data sync and better AI insights.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex space-x-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};