import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { WelcomeStep } from './steps/WelcomeStep';
import { CreateTeamStep } from './steps/CreateTeamStep';
import { ConnectIntegrationsStep } from './steps/ConnectIntegrationsStep';
import { ImportDataStep } from './steps/ImportDataStep';
import { GenerateFirstSummaryStep } from './steps/GenerateFirstSummaryStep';

export type OnboardingStep = 'welcome' | 'create-team' | 'integrations' | 'import' | 'summary';

interface OnboardingData {
  teamId?: number;
  teamName?: string;
  jiraConnected?: boolean;
  slackConnected?: boolean;
  dataImported?: boolean;
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());

  const steps: Array<{ key: OnboardingStep; title: string; description: string }> = [
    { key: 'welcome', title: 'Welcome', description: 'Get started' },
    { key: 'create-team', title: 'Create Team', description: 'Setup your team' },
    { key: 'integrations', title: 'Connect Tools', description: 'Link your workspace' },
    { key: 'import', title: 'Import Data', description: 'Sync existing data' },
    { key: 'summary', title: 'First Summary', description: 'Generate AI summary' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const handleNext = (data?: Partial<OnboardingData>) => {
    if (data) {
      setOnboardingData(prev => ({ ...prev, ...data }));
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />;
      case 'create-team':
        return (
          <CreateTeamStep
            onNext={handleNext}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 'integrations':
        return (
          <ConnectIntegrationsStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            teamId={onboardingData.teamId}
          />
        );
      case 'import':
        return (
          <ImportDataStep
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            teamId={onboardingData.teamId}
            hasIntegrations={onboardingData.jiraConnected || onboardingData.slackConnected}
          />
        );
      case 'summary':
        return (
          <GenerateFirstSummaryStep
            onNext={handleComplete}
            onBack={handleBack}
            teamId={onboardingData.teamId!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    {completedSteps.has(step.key) ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : currentStep === step.key ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                    ) : (
                      <Circle className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className={`text-sm font-medium ${
                      currentStep === step.key ? 'text-blue-600' :
                      completedSteps.has(step.key) ? 'text-green-600' :
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 mt-[-40px] ${
                    completedSteps.has(step.key) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <button
            onClick={handleComplete}
            className="text-blue-600 hover:text-blue-700"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  );
};