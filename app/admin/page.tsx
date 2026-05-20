'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Order } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function AdminPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<(Order & { user?: { name: string; email: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ orders: typeof orders }>('/api/admin/orders');
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.is_admin) load();
    else setLoading(false);
  }, [user]);

  async function updateOrder(orderId: number, patch: { status?: string; paymentStatus?: string }) {
    await api('/api/admin/orders', { method: 'PATCH', body: JSON.stringify({ orderId, ...patch }) });
    toast.push('Order updated');
    load();
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center glass rounded-2xl">
        <p>Sign in with your admin email.</p>
        <Link href="/" className="btn-gold mt-4 inline-block">Home</Link>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center glass rounded-2xl">
        <h2 className="font-display text-2xl mb-2">Admin only</h2>
        <p className="text-white/60 mb-4">Register with the email set in ADMIN_EMAIL on Vercel.</p>
        <Link href="/" className="btn-ghost">Back</Link>
      </div>
    );
  }

  const demoCount = orders.filter((o) => o.is_demo).length;
  const unpaidCount = orders.filter((o) => o.payment_status === 'unpaid' || !o.payment_status).length;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
          <p className="text-white/50">Demo orders and real orders — all appear here. Payment is after delivery.</p>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <div className="glass rounded-2xl p-6">
          <p className="text-white/50 text-sm">Total orders</p>
          <p className="text-3xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-white/50 text-sm">Demo orders</p>
          <p className="text-3xl font-bold mt-1 text-amber-400">{demoCount}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-white/50 text-sm">Awaiting payment</p>
          <p className="text-3xl font-bold mt-1">{unpaidCount}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-white/50 text-sm">Pay on delivery</p>
          <p className="text-lg font-medium mt-1 text-brand-gold-light">PhonePe · GPay · COD</p>
        </div>
      </div>

      {loading ? (
        <p className="text-white/50">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="glass rounded-2xl p-12 text-center text-white/50">No orders yet. Share your store link!</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className={`glass rounded-2xl p-6 animate-slide-up border-l-4 ${
                o.is_demo ? 'border-amber-400' : 'border-brand-gold'
              }`}
            >
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">Order #{o.id}</h3>
                    {o.is_demo && (
                      <span className="text-xs font-bold uppercase tracking-wide bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full">
                        Demo
                      </span>
                    )}
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full capitalize">
                      {o.payment_status || 'unpaid'}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm">{new Date(o.created_at).toLocaleString()}</p>
                  {o.user && (
                    <p className="text-sm mt-1">
                      <strong>{o.user.name}</strong> · {o.user.email} · {o.shipping_phone}
                    </p>
                  )}
                  <p className="text-sm text-white/60 mt-1">
                    {o.shipping_address}, {o.shipping_city}, {o.shipping_state} {o.shipping_pincode}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-2xl font-bold text-brand-gold-light">{formatPrice(Number(o.total))}</p>
                  <p className="text-sm text-white/50">{o.payment_method}</p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <select
                      className="text-sm rounded-lg bg-brand-navy-light border border-white/10 px-3 py-1"
                      value={o.status}
                      onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                    >
                      <option value="demo">demo</option>
                      <option value="awaiting_payment">awaiting_payment</option>
                      <option value="confirmed">confirmed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                    <select
                      className="text-sm rounded-lg bg-brand-navy-light border border-white/10 px-3 py-1"
                      value={o.payment_status || 'unpaid'}
                      onChange={(e) => updateOrder(o.id, { paymentStatus: e.target.value })}
                    >
                      <option value="unpaid">unpaid</option>
                      <option value="paid">paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <ul className="text-sm text-white/70 space-y-1">
                {o.items?.map((i, idx) => (
                  <li key={idx}>
                    {i.product_name} × {i.quantity} — {formatPrice(i.price * i.quantity)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
