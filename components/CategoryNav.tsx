'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CATS = [
  { id: 'all', label: 'All' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'sports', label: 'Sports' },
  { id: 'books', label: 'Books' },
  { id: 'groceries', label: 'Groceries' },
];

export function CategoryNav() {
  const params = useSearchParams();
  const current = params.get('category') || 'all';
  const search = params.get('search');

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
      {CATS.map((c) => {
        const q = new URLSearchParams();
        if (c.id !== 'all') q.set('category', c.id);
        if (search) q.set('search', search);
        const href = q.toString() ? `/?${q}` : '/';
        return (
          <Link
            key={c.id}
            href={href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              current === c.id ? 'btn-gold' : 'glass hover:border-brand-gold/30'
            }`}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
