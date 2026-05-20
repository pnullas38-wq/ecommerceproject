'use client';

import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { discountPercent, formatPrice } from '@/lib/utils';
import { useToast } from './Toast';

export function ProductCard({ product }: { product: Product }) {
  const { user, setCartCount } = useStore();
  const toast = useToast();
  const disc = discountPercent(Number(product.price), product.original_price ? Number(product.original_price) : null);

  async function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      toast.push('Sign in to add to cart');
      return;
    }
    try {
      await api('/api/cart', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      const cart = await api<{ itemCount: number }>('/api/cart');
      setCartCount(cart.itemCount);
      toast.push('Added to cart');
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group glass rounded-2xl overflow-hidden transition hover:shadow-glow hover:border-brand-gold/20 animate-slide-up"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-navy-light">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {disc > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-gold px-2 py-1 text-xs font-bold text-brand-navy">
            {disc}% OFF
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-2 mb-1 group-hover:text-brand-gold-light transition">{product.name}</h3>
        <p className="text-xs text-white/50 mb-2">★ {product.rating} · {product.reviews_count} reviews</p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold">{formatPrice(Number(product.price))}</span>
          {product.original_price && (
            <span className="text-sm text-white/40 line-through">{formatPrice(Number(product.original_price))}</span>
          )}
        </div>
        <button type="button" onClick={addToCart} className="btn-gold w-full text-sm py-2">
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
