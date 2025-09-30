import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CreditCard } from 'lucide-react';
import { billingApi } from '../services/api';

export const Checkout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const billingCycle = (searchParams.get('cycle') || 'monthly') as 'monthly' | 'yearly';

  useEffect(() => {
    const initiateCheckout = async () => {
      if (!planId) {
        setError('Invalid plan selected');
        setIsLoading(false);
        return;
      }

      try {
        const { checkout_url } = await billingApi.createCheckoutSession({
          plan_id: planId,
          billing_cycle: billingCycle,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`,
        });

        // Redirect to Stripe Checkout
        window.location.href = checkout_url;
      } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.response?.data?.message || 'Failed to create checkout session');
        setIsLoading(false);
      }
    };

    initiateCheckout();
  }, [planId, billingCycle]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to Checkout</h2>
        <p className="text-gray-600 mb-6">
          Please wait while we redirect you to our secure payment page...
        </p>
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your subscription has been activated. You now have access to all premium features.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            A confirmation email has been sent to your email address with your receipt and
            subscription details.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-3"
        >
          Go to Dashboard
        </button>

        <button
          onClick={() => navigate('/settings/billing')}
          className="w-full text-gray-600 hover:text-gray-800 text-sm"
        >
          View Billing Settings
        </button>
      </div>
    </div>
  );
};