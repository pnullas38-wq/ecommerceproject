'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) api<{ orders: Order[] }>('/api/orders').then((d) => setOrders(d.orders));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center glass rounded-2xl">
        <h2 className="font-display text-2xl mb-4">Sign in to view orders</h2>
        <Link href="/" className="btn-gold">Home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl mb-2">Your Orders</h1>
      <p className="text-white/50 mb-8">Pay after delivery using the method you chose at checkout.</p>
      {orders.length === 0 ? (
        <p className="text-white/50 glass rounded-2xl p-12 text-center">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="glass rounded-2xl p-6 animate-slide-up">
              <div className="flex flex-wrap justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                <div>
                  <strong>Order #{o.id}</strong>
                  {o.is_demo && (
                    <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Demo</span>
                  )}
                  <p className="text-sm text-white/50">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-blue-500/20 text-blue-300 px-3 py-1 text-sm capitalize block mb-1">
                    {o.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-white/50">
                    Payment: {o.payment_status || 'unpaid'}
                  </span>
                </div>
              </div>
              {o.items?.map((i, idx) => (
                <p key={idx} className="text-sm text-white/60">
                  {i.product_name} × {i.quantity} — {formatPrice(i.price * i.quantity)}
                </p>
              ))}
              <p className="mt-3 font-bold">
                {formatPrice(Number(o.total))} due on delivery · {o.payment_method}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
