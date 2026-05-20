'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { AuthModal } from './AuthModal';

export function Header() {
  const { user, cartCount, setUser, setCartCount } = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const toast = useToast();

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCartCount(0);
    toast.push('Signed out');
    router.push('/');
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 glass">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 lg:px-6">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
            <span className="text-gradient">Stuns</span>
          </Link>

          <form
            className="flex flex-1 min-w-[200px] max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/?search=${encodeURIComponent(search)}`);
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search premium products…"
              className="rounded-r-none"
            />
            <button type="submit" className="btn-gold rounded-l-none rounded-r-xl px-5">
              Search
            </button>
          </form>

          <nav className="flex items-center gap-2 ml-auto">
            {user?.is_admin && (
              <Link href="/admin" className="btn-ghost text-sm py-2 px-4">
                Admin
              </Link>
            )}
            <Link href="/orders" className="btn-ghost text-sm py-2 px-4 hidden sm:inline-flex">
              Orders
            </Link>
            <button type="button" className="btn-ghost text-sm py-2 px-4" onClick={() => (user ? logout() : setAuthOpen(true))}>
              {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign In'}
            </button>
            <Link href="/cart" className="btn-gold text-sm py-2 px-4 relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-brand-gold-light px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
