import React from 'react';
import { Sparkles, Zap, TrendingUp, Users } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export const WelcomeStep: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to AI Scrum Master
        </h1>
        <p className="text-lg text-gray-600">
          Let's set up your workspace and get you started with AI-powered agile management
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Zap className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Summaries</h3>
          <p className="text-sm text-gray-600">
            Generate intelligent standup summaries and insights automatically
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Smart Analytics</h3>
          <p className="text-sm text-gray-600">
            Track velocity, burndown, and team performance with AI analysis
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
          <p className="text-sm text-gray-600">
            Connect with Jira, Slack, and GitHub for seamless workflow
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <button
          onClick={onNext}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Get Started
        </button>
        <p className="text-sm text-gray-500">
          Takes less than 5 minutes to set up
        </p>
      </div>
    </div>
  );
};