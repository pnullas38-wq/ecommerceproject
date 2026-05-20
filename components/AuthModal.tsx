'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';
import { useToast } from './Toast';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setCartCount } = useStore();
  const toast = useToast();

  if (!open) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    };
    try {
      const data = await api<{ user: User; token: string }>(
        tab === 'login' ? '/api/auth/login' : '/api/auth/register',
        { method: 'POST', body: JSON.stringify(body) }
      );
      setUser(data.user);
      const cart = await api<{ itemCount: number }>('/api/cart').catch(() => ({ itemCount: 0 }));
      setCartCount(cart.itemCount);
      toast.push(tab === 'login' ? 'Welcome back!' : 'Account created!');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-premium animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl mb-6">{tab === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <div className="flex gap-2 mb-6">
          <button type="button" className={`flex-1 rounded-lg py-2 font-medium ${tab === 'login' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('login')}>
            Login
          </button>
          <button type="button" className={`flex-1 rounded-lg py-2 font-medium ${tab === 'register' ? 'btn-gold' : 'btn-ghost'}`} onClick={() => setTab('register')}>
            Register
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="text-sm text-white/60 mb-1 block">Name</label>
              <input name="name" required />
            </div>
          )}
          <div>
            <label className="text-sm text-white/60 mb-1 block">Email</label>
            <input name="email" type="email" required />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Password</label>
            <input name="password" type="password" minLength={6} required />
          </div>
          <button type="submit" className="btn-gold w-full" disabled={loading}>
            {loading ? 'Please wait…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
