import { Suspense } from 'react';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-10 text-white/50">Loading checkout…</div>}>{children}</Suspense>;
}
