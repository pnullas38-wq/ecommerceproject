'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { CartItem } from '@/lib/types';
import { calcShipping } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, setCartCount } = useStore();
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ items: CartItem[]; subtotal: number; itemCount: number }>('/api/cart');
      setItems(data.items);
      setSubtotal(data.subtotal);
      setCartCount(data.itemCount);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
    else setLoading(false);
  }, [user]);

  async function updateQty(productId: number, quantity: number) {
    await api(`/api/cart/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) });
    load();
  }

  async function remove(productId: number) {
    await api(`/api/cart/${productId}`, { method: 'DELETE' });
    toast.push('Removed');
    load();
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center glass rounded-2xl">
        <h2 className="font-display text-2xl mb-4">Sign in to view cart</h2>
        <Link href="/" className="btn-gold">Continue shopping</Link>
      </div>
    );
  }

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Your Cart</h1>
      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/60 mb-6">Your cart is empty</p>
          <Link href="/" className="btn-gold">Shop now</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <div key={i.id} className="glass flex gap-4 rounded-2xl p-4 animate-slide-up">
                <div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden">
                  <Image src={i.image} alt={i.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{i.name}</h3>
                  <p className="text-brand-gold-light">{formatPrice(i.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" className="btn-ghost w-8 h-8 p-0 text-sm" onClick={() => updateQty(i.product_id, i.quantity - 1)}>
                      −
                    </button>
                    <span>{i.quantity}</span>
                    <button
                      type="button"
                      className="btn-ghost w-8 h-8 p-0 text-sm"
                      onClick={() => updateQty(i.product_id, i.quantity + 1)}
                      disabled={i.quantity >= i.stock}
                    >
                      +
                    </button>
                    <button type="button" className="text-red-400 text-sm ml-4" onClick={() => remove(i.product_id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatPrice(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-6 h-fit sticky top-28">
            <h3 className="font-display text-xl mb-4">Summary</h3>
            <div className="space-y-2 text-white/80 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping ? formatPrice(shipping) : 'FREE'}</span></div>
              <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/10">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-gold w-full block text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
