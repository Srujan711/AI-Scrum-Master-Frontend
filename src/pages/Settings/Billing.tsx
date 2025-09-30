import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Calendar, TrendingUp, Download, AlertCircle, ExternalLink, XCircle } from 'lucide-react';
import { billingApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Subscription {
  id: string;
  status: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
  };
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface Usage {
  current_period: {
    ai_operations: number;
    teams: number;
    members: number;
  };
  limits: {
    ai_operations: number;
    teams: number;
    members: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  created: string;
  invoice_pdf: string;
}

export const Billing: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: subscription, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: billingApi.getSubscription,
  });

  const { data: usage, isLoading: usageLoading } = useQuery<Usage>({
    queryKey: ['usage'],
    queryFn: billingApi.getUsage,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: billingApi.getInvoices,
  });

  const portalMutation = useMutation({
    mutationFn: () => billingApi.createPortalSession(window.location.href),
    onSuccess: (data) => {
      window.location.href = data.portal_url;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: billingApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelConfirm(false);
    },
  });

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (subLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Current Plan</h2>
            <p className="text-sm text-gray-600">Your active subscription details</p>
          </div>
          {subscription && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : subscription.status === 'past_due'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          )}
        </div>

        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {subscription.plan.name}
                </h3>
                <p className="text-gray-600">
                  ${subscription.plan.price}/{subscription.plan.interval}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>

                {subscription.payment_method && (
                  <div className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {subscription.payment_method.brand} ending in {subscription.payment_method.last4}
                    </span>
                  </div>
                )}

                {subscription.cancel_at_period_end && (
                  <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Cancellation Scheduled</p>
                      <p>Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {portalMutation.isPending ? 'Loading...' : 'Manage Subscription'}
              </button>

              {!subscription.cancel_at_period_end && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You're currently on the Free plan</p>
            <a
              href="/pricing"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upgrade Plan
            </a>
          </div>
        )}
      </div>

      {/* Usage This Month */}
      {usage && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Usage This Month</h2>
              <p className="text-sm text-gray-600">Track your current usage against plan limits</p>
            </div>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-6">
            {/* AI Operations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">AI Operations</span>
                <span className={`text-sm font-semibold ${getUsageColor(getUsagePercentage(usage.current_period.ai_operations, usage.limits.ai_operations))}`}>
                  {usage.current_period.ai_operations} / {usage.limits.ai_operations === -1 ? '∞' : usage.limits.ai_operations}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getUsagePercentage(usage.current_period.ai_operations, usage.limits.ai_operations) >= 90
                      ? 'bg-red-500'
                      : getUsagePercentage(usage.current_period.ai_operations, usage.limits.ai_operations) >= 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(getUsagePercentage(usage.current_period.ai_operations, usage.limits.ai_operations), 100)}%` }}
                />
              </div>
            </div>

            {/* Teams */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Teams</span>
                <span className="text-sm font-semibold text-gray-900">
                  {usage.current_period.teams} / {usage.limits.teams === -1 ? '∞' : usage.limits.teams}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(getUsagePercentage(usage.current_period.teams, usage.limits.teams), 100)}%` }}
                />
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Team Members</span>
                <span className="text-sm font-semibold text-gray-900">
                  {usage.current_period.members} / {usage.limits.members === -1 ? '∞' : usage.limits.members}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(getUsagePercentage(usage.current_period.members, usage.limits.members), 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice History</h2>

        {invoicesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(invoice.created).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      ${(invoice.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'open'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access
              until the end of your billing period on{' '}
              {subscription && new Date(subscription.current_period_end).toLocaleDateString()}.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};