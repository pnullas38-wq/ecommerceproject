'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { PAY_ON_DELIVERY_METHODS, type PaymentMethodId } from '@/lib/payment-methods';
import { useStore } from '@/lib/store';
import type { CartItem } from '@/lib/types';
import { calcShipping, formatPrice } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function CheckoutPage() {
  const { user } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [payment, setPayment] = useState<PaymentMethodId>('phonepe');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      api<{ items: CartItem[]; subtotal: number }>('/api/cart').then((d) => {
        setItems(d.items);
        setSubtotal(d.subtotal);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center glass rounded-2xl">
        <h2 className="font-display text-2xl mb-4">Sign in to checkout</h2>
        <Link href="/" className="btn-gold">Go home</Link>
      </div>
    );
  }

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  function getShipping(fd: FormData) {
    return {
      shippingName: fd.get('name') as string,
      shippingPhone: fd.get('phone') as string,
      shippingAddress: fd.get('address') as string,
      shippingCity: fd.get('city') as string,
      shippingState: fd.get('state') as string,
      shippingPincode: fd.get('pincode') as string,
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const ship = getShipping(fd);

    try {
      const { order } = await api<{ order: { id: number } }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ ...ship, paymentMethodId: payment }),
      });
      router.push(`/checkout/success?order=${order.id}&method=${payment}`);
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
      <h1 className="font-display text-3xl mb-2">Checkout</h1>
      <p className="text-white/60 mb-8 max-w-2xl">
        No payment now. Your order is sent to the store immediately. Pay after delivery using the method you choose below.
      </p>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-xl mb-4">Delivery address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-white/60 block mb-1">Full name</label>
                <input name="name" required defaultValue={user.name} />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">Phone (for PhonePe / GPay)</label>
                <input name="phone" required pattern="[0-9]{10}" placeholder="10 digit mobile" />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">Pincode</label>
                <input name="pincode" required pattern="[0-9]{6}" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-white/60 block mb-1">Address</label>
                <textarea name="address" rows={2} required />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">City</label>
                <input name="city" required />
              </div>
              <div>
                <label className="text-sm text-white/60 block mb-1">State</label>
                <input name="state" required />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-xl mb-2">Pay after delivery</h3>
            <p className="text-sm text-white/50 mb-4">Select how you will pay when the order arrives. No money is charged now.</p>
            <div className="space-y-3">
              {PAY_ON_DELIVERY_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                    payment === m.id
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-white/10 hover:border-white/20'
                  } ${m.isDemo ? 'border-dashed' : ''}`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="mt-1"
                  />
                  <span className="text-2xl" aria-hidden>
                    {m.icon}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {m.title}
                      {m.isDemo && (
                        <span className="ml-2 text-xs font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                          Test
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-white/50">{m.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 h-fit sticky top-28">
          <h3 className="font-display text-xl mb-4">Order summary</h3>
          {items.map((i) => (
            <p key={i.id} className="text-sm text-white/60 mb-1">
              {i.name} x {i.quantity}
            </p>
          ))}
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping ? formatPrice(shipping) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Due on delivery</span>
              <span className="text-brand-gold-light">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-4">Payment collected only after delivery. Store owner gets your order instantly.</p>
          <button type="submit" className="btn-gold w-full mt-6" disabled={loading || !items.length}>
            {loading ? 'Placing order…' : 'Place Order (No payment now)'}
          </button>
        </div>
      </form>
    </div>
  );
}
