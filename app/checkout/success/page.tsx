'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getPaymentMethodLabel, type PaymentMethodId } from '@/lib/payment-methods';
import { useStore } from '@/lib/store';
export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const method = (params.get('method') || 'cod') as PaymentMethodId;
  const isDemo = method === 'demo';
  const { setCartCount } = useStore();

  useEffect(() => {
    setCartCount(0);
  }, [setCartCount]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="glass rounded-3xl p-12 animate-slide-up shadow-glow">
        <div className="text-6xl mb-4">{isDemo ? '🧪' : '✓'}</div>
        <h1 className="font-display text-3xl text-gradient mb-2">
          {isDemo ? 'Demo order placed' : 'Order confirmed'}
        </h1>
        {orderId && <p className="text-white/70 mb-2">Order #{orderId}</p>}
        {isDemo ? (
          <p className="text-amber-300/90 text-sm mb-4 rounded-lg bg-amber-400/10 px-4 py-3">
            This is a test order. The store owner still receives it in Admin — no payment needed.
          </p>
        ) : (
          <p className="text-white/60 mb-4">
            Pay <strong>{getPaymentMethodLabel(method)}</strong> when your order is delivered. No charge was made today.
          </p>
        )}
        <ul className="text-left text-sm text-white/50 space-y-2 mb-8 glass rounded-xl p-4">
          <li>1. Store prepares your order</li>
          <li>2. Delivery to your address</li>
          <li>3. Pay the delivery person via {getPaymentMethodLabel(method)}</li>
        </ul>
        <div className="flex flex-col gap-3">
          <Link href="/orders" className="btn-gold">View my orders</Link>
          <Link href="/" className="btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
