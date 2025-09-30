import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Zap, Users, TrendingUp, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type BillingCycle = 'monthly' | 'yearly';

interface PricingTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: Array<{
    text: string;
    included: boolean;
  }>;
  limits: {
    teams: string;
    members: string;
    aiOperations: string;
  };
  cta: string;
  popular?: boolean;
  color: string;
}

export const Pricing: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const currentTier = user?.subscription_tier || 'free';

  const tiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      icon: <Sparkles className="w-6 h-6" />,
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out AI Scrum Master',
      limits: {
        teams: '1 team',
        members: '5 members',
        aiOperations: '50 AI operations/month',
      },
      features: [
        { text: 'Daily standup summaries', included: true },
        { text: 'Basic sprint tracking', included: true },
        { text: 'Email support', included: true },
        { text: 'Backlog AI analysis', included: false },
        { text: 'Sprint planning AI', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Slack integration', included: false },
        { text: 'Jira integration', included: false },
      ],
      cta: 'Get Started',
      color: 'blue',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: <Zap className="w-6 h-6" />,
      price: { monthly: 49, yearly: 470 },
      description: 'Best for growing teams',
      limits: {
        teams: '3 teams',
        members: '15 members',
        aiOperations: '500 AI operations/month',
      },
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Backlog AI analysis', included: true },
        { text: 'Sprint planning AI', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Slack integration', included: true },
        { text: 'Jira integration', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom integrations', included: false },
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      color: 'purple',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: <Crown className="w-6 h-6" />,
      price: { monthly: 199, yearly: 1990 },
      description: 'For large organizations',
      limits: {
        teams: 'Unlimited teams',
        members: 'Unlimited members',
        aiOperations: 'Unlimited AI operations',
      },
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Unlimited teams & members', included: true },
        { text: 'Unlimited AI operations', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Advanced security & SSO', included: true },
        { text: 'Custom contracts', included: true },
      ],
      cta: 'Contact Sales',
      color: 'orange',
    },
  ];

  const handleSelectPlan = (tierId: string) => {
    if (!isAuthenticated) {
      navigate('/signup', { state: { selectedPlan: tierId } });
      return;
    }

    if (tierId === 'free') {
      navigate('/dashboard');
      return;
    }

    if (tierId === 'enterprise') {
      window.location.href = 'mailto:sales@aiscrummaster.com?subject=Enterprise Plan Inquiry';
      return;
    }

    // Navigate to checkout
    navigate(`/checkout/${tierId}?cycle=${billingCycle}`);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; button: string }> = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            AI Scrum Master
          </Link>
          {!isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose the plan that's right for your team
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const colors = getColorClasses(tier.color);
            const price =
              billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;
            const isCurrentPlan = currentTier === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                  tier.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}

                <div className={`${colors.bg} ${colors.border} border-b p-8`}>
                  <div className={`inline-flex p-3 ${colors.bg} rounded-lg ${colors.text} mb-4`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-4">{tier.description}</p>

                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      ${price}
                    </span>
                    {tier.price.monthly > 0 && (
                      <span className="text-gray-600 ml-2">
                        / {billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>

                  {billingCycle === 'yearly' && tier.price.yearly > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Save ${tier.price.monthly * 12 - tier.price.yearly} per year
                    </p>
                  )}
                </div>

                <div className="p-8">
                  {/* Limits */}
                  <div className="mb-6 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {tier.limits.teams}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {tier.limits.members}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {tier.limits.aiOperations}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(tier.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `${colors.button} text-white`
                    }`}
                  >
                    {isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        {tier.cta}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              What counts as an AI operation?
            </h3>
            <p className="text-gray-600 text-sm">
              An AI operation includes generating standup summaries, backlog analysis,
              sprint planning suggestions, and any AI-powered insights or recommendations.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect
              immediately and billing is prorated.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Do you offer a free trial?
            </h3>
            <p className="text-gray-600 text-sm">
              Yes! All paid plans come with a 14-day free trial. No credit card required
              to start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};