import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTeamStore } from '../../stores/teamStore';
import { integrationApi } from '../../services/api';

interface JiraSettings {
  server_url: string;
  username: string;
  api_token: string;
  project_key: string;
}

interface SlackSettings {
  bot_token: string;
  channel_id: string;
  webhook_url?: string;
}

interface GitHubSettings {
  access_token: string;
  repository: string;
  organization?: string;
}

export const IntegrationSettings: React.FC = () => {
  const { currentTeam } = useTeamStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'jira' | 'slack' | 'github'>('jira');
  const [testResults, setTestResults] = useState<{[key: string]: { success: boolean; message: string }}>({});

  const { register: registerJira, handleSubmit: handleJiraSubmit, formState: { errors: jiraErrors } } = useForm<JiraSettings>();
  const { register: registerSlack, handleSubmit: handleSlackSubmit, formState: { errors: slackErrors } } = useForm<SlackSettings>();
  const { register: registerGitHub, handleSubmit: handleGitHubSubmit, formState: { errors: githubErrors } } = useForm<GitHubSettings>();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', currentTeam?.id],
    queryFn: () => integrationApi.getIntegrations(currentTeam!.id),
    enabled: !!currentTeam,
  });

  const updateJiraMutation = useMutation({
    mutationFn: (data: JiraSettings) => integrationApi.updateJiraSettings(currentTeam!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const updateSlackMutation = useMutation({
    mutationFn: (data: SlackSettings) => integrationApi.updateSlackSettings(currentTeam!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const updateGitHubMutation = useMutation({
    mutationFn: (data: GitHubSettings) => integrationApi.updateGitHubSettings(currentTeam!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: ({ integration, data }: { integration: string; data: any }) =>
      integrationApi.testConnection(currentTeam!.id, integration, data),
    onSuccess: (result, variables) => {
      setTestResults(prev => ({
        ...prev,
        [variables.integration]: result
      }));
    },
  });

  const onJiraSubmit = (data: JiraSettings) => {
    updateJiraMutation.mutate(data);
  };

  const onSlackSubmit = (data: SlackSettings) => {
    updateSlackMutation.mutate(data);
  };

  const onGitHubSubmit = (data: GitHubSettings) => {
    updateGitHubMutation.mutate(data);
  };

  const handleTestConnection = (integration: string, data: any) => {
    testConnectionMutation.mutate({ integration, data });
  };

  if (!currentTeam) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Please select a team to configure integrations.</p>
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

  const tabs = [
    { id: 'jira', name: 'Jira', icon: '🔗' },
    { id: 'slack', name: 'Slack', icon: '💬' },
    { id: 'github', name: 'GitHub', icon: '🐙' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>
        <p className="text-gray-600 mt-1">
          Connect your team's tools for seamless workflow automation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Jira Integration */}
          {activeTab === 'jira' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Jira Integration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Connect to Jira to sync backlog items and track progress automatically.
                </p>
              </div>

              <form onSubmit={handleJiraSubmit(onJiraSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Server URL</label>
                    <input
                      {...registerJira('server_url', { required: 'Server URL is required' })}
                      type="url"
                      placeholder="https://your-domain.atlassian.net"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {jiraErrors.server_url && (
                      <p className="mt-1 text-sm text-red-600">{jiraErrors.server_url.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Key</label>
                    <input
                      {...registerJira('project_key', { required: 'Project key is required' })}
                      type="text"
                      placeholder="PROJ"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {jiraErrors.project_key && (
                      <p className="mt-1 text-sm text-red-600">{jiraErrors.project_key.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username/Email</label>
                    <input
                      {...registerJira('username', { required: 'Username is required' })}
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {jiraErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{jiraErrors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">API Token</label>
                    <input
                      {...registerJira('api_token', { required: 'API token is required' })}
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {jiraErrors.api_token && (
                      <p className="mt-1 text-sm text-red-600">{jiraErrors.api_token.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={updateJiraMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateJiraMutation.isPending ? 'Saving...' : 'Save Jira Settings'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
                      const data = Object.fromEntries(formData.entries()) as any;
                      handleTestConnection('jira', data);
                    }}
                    disabled={testConnectionMutation.isPending}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testResults.jira && (
                  <div className={`p-3 rounded-md ${testResults.jira.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {testResults.jira.message}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Slack Integration */}
          {activeTab === 'slack' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Slack Integration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Connect to Slack to automatically post standup summaries and notifications.
                </p>
              </div>

              <form onSubmit={handleSlackSubmit(onSlackSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bot Token</label>
                  <input
                    {...registerSlack('bot_token', { required: 'Bot token is required' })}
                    type="password"
                    placeholder="xoxb-..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {slackErrors.bot_token && (
                    <p className="mt-1 text-sm text-red-600">{slackErrors.bot_token.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel ID</label>
                  <input
                    {...registerSlack('channel_id', { required: 'Channel ID is required' })}
                    type="text"
                    placeholder="C1234567890"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {slackErrors.channel_id && (
                    <p className="mt-1 text-sm text-red-600">{slackErrors.channel_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Webhook URL (Optional)</label>
                  <input
                    {...registerSlack('webhook_url')}
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={updateSlackMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateSlackMutation.isPending ? 'Saving...' : 'Save Slack Settings'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
                      const data = Object.fromEntries(formData.entries()) as any;
                      handleTestConnection('slack', data);
                    }}
                    disabled={testConnectionMutation.isPending}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testResults.slack && (
                  <div className={`p-3 rounded-md ${testResults.slack.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {testResults.slack.message}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* GitHub Integration */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">GitHub Integration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Connect to GitHub to track commits, pull requests, and development activity.
                </p>
              </div>

              <form onSubmit={handleGitHubSubmit(onGitHubSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Token</label>
                  <input
                    {...registerGitHub('access_token', { required: 'Access token is required' })}
                    type="password"
                    placeholder="ghp_..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {githubErrors.access_token && (
                    <p className="mt-1 text-sm text-red-600">{githubErrors.access_token.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Repository</label>
                    <input
                      {...registerGitHub('repository', { required: 'Repository is required' })}
                      type="text"
                      placeholder="my-project"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {githubErrors.repository && (
                      <p className="mt-1 text-sm text-red-600">{githubErrors.repository.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization (Optional)</label>
                    <input
                      {...registerGitHub('organization')}
                      type="text"
                      placeholder="my-org"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={updateGitHubMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateGitHubMutation.isPending ? 'Saving...' : 'Save GitHub Settings'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
                      const data = Object.fromEntries(formData.entries()) as any;
                      handleTestConnection('github', data);
                    }}
                    disabled={testConnectionMutation.isPending}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>

                {testResults.github && (
                  <div className={`p-3 rounded-md ${testResults.github.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {testResults.github.message}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <span className="mr-3">🔗</span>
              <span className="font-medium">Jira</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${integrations?.jira_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <span className="mr-3">💬</span>
              <span className="font-medium">Slack</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${integrations?.slack_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <span className="mr-3">🐙</span>
              <span className="font-medium">GitHub</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${integrations?.github_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};