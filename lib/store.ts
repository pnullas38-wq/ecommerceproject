'use client';

import { create } from 'zustand';
import type { User } from './types';

type Store = {
  user: User | null;
  cartCount: number;
  setUser: (user: User | null) => void;
  setCartCount: (n: number) => void;
};

export const useStore = create<Store>((set) => ({
  user: null,
  cartCount: 0,
  setUser: (user) => set({ user }),
  setCartCount: (cartCount) => set({ cartCount }),
}));
