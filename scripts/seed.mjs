import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const db = createClient(url, key);

const products = [
  { name: 'Wireless Bluetooth Headphones', description: 'Noise-cancelling over-ear headphones with 30hr battery.', price: 2499, original_price: 4999, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', stock: 45, rating: 4.6, reviews_count: 1284, featured: true },
  { name: 'Smart Watch Series X', description: 'Fitness tracking, GPS, 7-day battery.', price: 3999, original_price: 7999, category: 'electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', stock: 32, rating: 4.4, reviews_count: 892, featured: true },
  { name: "Men's Casual Cotton T-Shirt", description: '100% organic cotton, breathable fit.', price: 599, original_price: 999, category: 'fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', stock: 120, rating: 4.3, reviews_count: 456, featured: true },
  { name: "Women's Running Shoes", description: 'Lightweight mesh with cushioned sole.', price: 1899, original_price: 3499, category: 'fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', stock: 58, rating: 4.7, reviews_count: 2103, featured: true },
  { name: 'Stainless Steel Cookware Set', description: '10-piece non-stick set, oven-safe.', price: 3499, original_price: 5999, category: 'home', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', stock: 25, rating: 4.5, reviews_count: 678, featured: false },
  { name: 'Robot Vacuum Cleaner', description: 'Smart mapping, 120 min runtime.', price: 12999, original_price: 18999, category: 'home', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop', stock: 18, rating: 4.2, reviews_count: 334, featured: true },
  { name: 'Vitamin C Face Serum', description: 'Brightening serum with hyaluronic acid.', price: 799, original_price: 1299, category: 'beauty', image: 'https://images.unsplash.com/photo-1620916564555-4e7eeef5770a?w=400&h=400&fit=crop', stock: 90, rating: 4.8, reviews_count: 1567, featured: false },
  { name: 'Yoga Mat Premium', description: '6mm anti-slip eco TPE mat.', price: 899, original_price: 1499, category: 'sports', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', stock: 75, rating: 4.6, reviews_count: 445, featured: false },
  { name: 'Adjustable Dumbbell Set', description: '5–25 kg quick-lock dumbbells.', price: 4999, original_price: 7999, category: 'sports', image: 'https://images.unsplash.com/photo-1583454110551-21f2d2b7fb1a?w=400&h=400&fit=crop', stock: 22, rating: 4.5, reviews_count: 289, featured: true },
  { name: 'The Art of Programming', description: 'Guide to clean code and design patterns.', price: 449, original_price: 699, category: 'books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', stock: 200, rating: 4.9, reviews_count: 3421, featured: false },
  { name: 'Organic Basmati Rice 5kg', description: 'Premium aged basmati rice.', price: 649, original_price: 899, category: 'groceries', image: 'https://images.unsplash.com/photo-1586201375767-2fccffdb803e?w=400&h=400&fit=crop', stock: 150, rating: 4.7, reviews_count: 892, featured: false },
  { name: 'Car Phone Mount', description: 'Magnetic 360° dashboard mount.', price: 399, original_price: 799, category: 'automotive', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop', stock: 85, rating: 4.1, reviews_count: 156, featured: false },
  { name: '4K Ultra HD Smart TV 55"', description: 'Dolby Vision Android TV.', price: 42999, original_price: 59999, category: 'electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=400&fit=crop', stock: 12, rating: 4.5, reviews_count: 567, featured: true },
  { name: 'Leather Wallet', description: 'RFID blocking genuine leather.', price: 1299, original_price: 2499, category: 'fashion', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', stock: 64, rating: 4.4, reviews_count: 234, featured: false },
  { name: 'Air Purifier HEPA', description: '99.97% allergen removal, 400 sq ft.', price: 8999, original_price: 12999, category: 'home', image: 'https://images.unsplash.com/photo-1585771724684-fa180fbfab3a?w=400&h=400&fit=crop', stock: 30, rating: 4.6, reviews_count: 412, featured: true },
  { name: 'Sunscreen SPF 50', description: 'Broad spectrum, water resistant.', price: 549, original_price: 799, category: 'beauty', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', stock: 110, rating: 4.7, reviews_count: 789, featured: false },
];

const { count } = await db.from('products').select('*', { count: 'exact', head: true });
if (count > 0) {
  console.log(`Already ${count} products. Skipping.`);
  process.exit(0);
}

const { error } = await db.from('products').insert(products);
if (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(`Seeded ${products.length} products.`);
