'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api-client';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { discountPercent, formatPrice } from '@/lib/utils';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { user, setCartCount } = useStore();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    api<{ product: Product }>(`/api/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch(() => setProduct(null));
  }, [id]);

  const addToCart = async () => {
    if (!product || !user) {
      toast.push('Sign in first');
      return;
    }
    await api('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: qty }),
    });
    const cart = await api<{ itemCount: number }>('/api/cart');
    setCartCount(cart.itemCount);
    toast.push('Added to cart');
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-white/50">Loading...</div>
    );
  }

  const disc = discountPercent(
    Number(product.price),
    product.original_price ? Number(product.original_price) : null
  );
  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6 py-10 animate-fade-in">
      <button type="button" className="btn-ghost mb-6 text-sm" onClick={() => router.back()}>
        Back
      </button>
      <div className="grid md:grid-cols-2 gap-10 glass rounded-3xl p-6 md:p-10">
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
        </div>
        <div>
          <p className="text-brand-gold text-sm uppercase tracking-wider mb-2">{product.category}</p>
          <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
          <p className="text-white/50 mb-4">
            Rating {product.rating} ({product.reviews_count} reviews)
          </p>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">{formatPrice(Number(product.price))}</span>
            {product.original_price ? (
              <span className="text-lg text-white/40 line-through">
                {formatPrice(Number(product.original_price))}
              </span>
            ) : null}
            {disc > 0 ? <span className="text-emerald-400 font-medium">{disc}% off</span> : null}
          </div>
          <p className="text-white/70 mb-6 leading-relaxed">{product.description}</p>
          <p className={product.stock > 5 ? 'text-emerald-400' : 'text-amber-400'}>
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </p>
          <div className="flex items-center gap-4 my-8">
            <span className="text-white/60">Qty</span>
            <button
              type="button"
              className="btn-ghost w-10 h-10 p-0"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="text-xl font-semibold w-8 text-center">{qty}</span>
            <button
              type="button"
              className="btn-ghost w-10 h-10 p-0"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            >
              +
            </button>
          </div>
          <div className="flex gap-4">
            <button type="button" className="btn-gold flex-1" onClick={addToCart} disabled={outOfStock}>
              Add to Cart
            </button>
            <button type="button" className="btn-ghost flex-1" onClick={() => router.push('/checkout')}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
