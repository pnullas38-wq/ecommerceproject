import { Suspense } from 'react';

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-10 text-white/50">Loading…</div>}>{children}</Suspense>;
}
