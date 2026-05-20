'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setCartCount } = useStore();

  useEffect(() => {
    api<{ user: User }>('/api/auth/me')
      .then(async ({ user }) => {
        setUser(user);
        const cart = await api<{ itemCount: number }>('/api/cart').catch(() => ({ itemCount: 0 }));
        setCartCount(cart.itemCount);
      })
      .catch(() => {
        setUser(null);
        setCartCount(0);
      });
  }, [setUser, setCartCount]);

  return <>{children}</>;
}
