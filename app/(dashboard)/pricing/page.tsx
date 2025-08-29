import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { cookies } from 'next/headers';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  // Check if we're a test user
  const sessionCookie = (await cookies()).get('session');
  let isTestUser = false;
  
  if (sessionCookie) {
    try {
      const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
      const sessionData = JSON.parse(decoded);
      if (sessionData.user?.id === 'test-user-123') {
        isTestUser = true;
      }
    } catch (e) {
      // Not a test user
    }
  }

  let prices, products;
  
  if (isTestUser) {
    // Mock data for test users
    prices = [
      {
        id: 'price_test_base',
        productId: 'prod_test_base',
        unitAmount: 800,
        currency: 'usd',
        interval: 'month',
        trialPeriodDays: 7
      },
      {
        id: 'price_test_plus',
        productId: 'prod_test_plus',
        unitAmount: 1200,
        currency: 'usd',
        interval: 'month',
        trialPeriodDays: 7
      }
    ];
    
    products = [
      {
        id: 'prod_test_base',
        name: 'Base',
        description: 'Perfect for small teams',
        defaultPriceId: 'price_test_base'
      },
      {
        id: 'prod_test_plus',
        name: 'Plus',
        description: 'For growing businesses',
        defaultPriceId: 'price_test_plus'
      }
    ];
  } else {
    // Real data for actual users
    [prices, products] = await Promise.all([
      getStripePrices(),
      getStripeProducts(),
    ]);
  }

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {isTestUser && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-8 max-w-xl mx-auto">
          <p className="text-sm text-yellow-800">
            <strong>Test Mode:</strong> Showing mock pricing data. 
            Real Stripe integration requires valid API keys.
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        <PricingCard
          name={basePlan?.name || 'Base'}
          price={basePrice?.unitAmount || 800}
          interval={basePrice?.interval || 'month'}
          trialDays={basePrice?.trialPeriodDays || 7}
          features={[
            'Unlimited Usage',
            'Unlimited Workspace Members',
            'Email Support',
          ]}
          priceId={basePrice?.id}
          isTestUser={isTestUser}
        />
        <PricingCard
          name={plusPlan?.name || 'Plus'}
          price={plusPrice?.unitAmount || 1200}
          interval={plusPrice?.interval || 'month'}
          trialDays={plusPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            'Early Access to New Features',
            '24/7 Support + Slack Access',
          ]}
          priceId={plusPrice?.id}
          isTestUser={isTestUser}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  isTestUser,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  isTestUser?: boolean;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        ${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          per user / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      {isTestUser ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Stripe checkout disabled in test mode
          </p>
        </div>
      ) : (
        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
