'use client';

import { create } from 'zustand';

type ToastState = {
  message: string;
  show: boolean;
  push: (message: string) => void;
};

export const useToast = create<ToastState>((set) => ({
  message: '',
  show: false,
  push: (message) => {
    set({ message, show: true });
    setTimeout(() => set({ show: false }), 3200);
  },
}));

export function Toast() {
  const { message, show } = useToast();
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] max-w-sm rounded-xl border border-brand-gold/30 bg-brand-slate px-5 py-4 shadow-glow transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
}
