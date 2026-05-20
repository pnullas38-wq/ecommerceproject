'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

function Skeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden shimmer-bg">
      <div className="aspect-square bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProductGrid({
  category,
  search,
  featured,
  title,
}: {
  category?: string;
  search?: string;
  featured?: boolean;
  title: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    if (featured) params.set('featured', '1');
    api<{ products: Product[] }>(`/api/products?${params}`)
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, featured]);

  return (
    <section className="mb-16">
      <h2 className="font-display text-2xl md:text-3xl mb-8">{title}</h2>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-white/50">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
