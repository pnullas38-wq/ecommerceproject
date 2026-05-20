import { Suspense } from 'react';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductGrid } from '@/components/ProductGrid';

export default function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const category = searchParams.category || 'all';
  const search = searchParams.search;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-8">
      <section className="relative mb-16 overflow-hidden rounded-3xl glass p-10 md:p-16 animate-slide-up">
        <div className="relative z-10 max-w-2xl">
          <p className="text-brand-gold text-sm font-semibold tracking-widest uppercase mb-3">Premium Collection</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">
            Shop the <span className="text-gradient">extraordinary</span>
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Order now, pay after delivery. PhonePe, Google Pay, COD, or demo test orders — you get every order in Admin.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/50">
            <span className="glass rounded-full px-4 py-2">PhonePe</span>
            <span className="glass rounded-full px-4 py-2">Google Pay</span>
            <span className="glass rounded-full px-4 py-2">Cash on Delivery</span>
            <span className="glass rounded-full px-4 py-2">Demo orders</span>
            <span className="glass rounded-full px-4 py-2">Free ship ₹499+</span>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
      </section>

      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>

      {!search && <ProductGrid featured={true} title="Featured" />}
      <ProductGrid
        category={category}
        search={search}
        title={search ? `Results for “${search}”` : 'All Products'}
      />
    </div>
  );
}
