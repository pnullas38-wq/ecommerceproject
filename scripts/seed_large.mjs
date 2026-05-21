import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let db;
let isLocalMode = false;

if (!url || !key) {
  console.log('Environment variables not found. Running in Local Database Mode.');
  isLocalMode = true;
} else {
  db = createClient(url, key);
}

// Product Category Unsplash Image pools (high resolution, relevant)
const IMAGE_POOLS = {
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&auto=format&fit=crop&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80'
  ],
  home: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585771724684-fa180fbfab3a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507504038482-7621c379e54d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595231712426-63e4da5149ac?w=600&auto=format&fit=crop&q=80'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1620916564555-4e7eeef5770a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2d2b7fb1a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517599211603-02c3c94a5033?w=600&auto=format&fit=crop&q=80'
  ],
  books: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'
  ],
  groceries: [
    'https://images.unsplash.com/photo-1586201375767-2fccffdb803e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&auto=format&fit=crop&q=80'
  ]
};

// Modifiers to create unique items
const BRANDS = ['Aura', 'Apex', 'Zenith', 'Quantum', 'Volt', 'Nomad', 'Nebula', 'Titan', 'Core', 'Velo', 'Optima', 'Stellar', 'Solas', 'Peak', 'Nexus'];
const ADJECTIVES = ['Premium', 'Ultra', 'Smart', 'Pro', 'Next-Gen', 'Pocket', 'Portable', 'Ergonomic', 'Dual', 'Mini', 'Super', 'Multi-Functional', 'HD', 'Turbo', 'Classic', 'Studio', 'Elite', 'Max', 'Air', 'Active', 'Sonic', 'Pulse', 'Wave', 'Aero', 'Flow', 'Glide'];
const COLORS = ['Midnight Black', 'Platinum Silver', 'Space Gray', 'Arctic White', 'Royal Blue', 'Emerald Green', 'Rose Gold', 'Classic Navy', 'Charcoal', 'Amber Gold'];
const FEATURES = ['high-performance components', 'long-lasting build quality', 'intuitive controls', 'eco-friendly materials', 'a modern sleek design', 'rapid response functions', 'enhanced usability features', 'ergonomic handling'];
const EXTRA_FEATURES = ['a sleek carrying pouch', '1-year replacement warranty', 'customizable profiles', 'integrated smart connectivity', 'advanced safety protections', 'compact travel design', 'energy-efficient power usage'];

const TEMPLATES = {
  electronics: [
    { name: 'Wireless Headphones', desc: 'Active noise-cancelling over-ear headphones', price: 4999 },
    { name: 'Wireless Earbuds', desc: 'True wireless stereo earbuds with charging case', price: 2499 },
    { name: 'Smart Fitness Watch', desc: 'Next-gen fitness tracker with continuous heart rate monitoring', price: 5999 },
    { name: 'Bluetooth Speaker', desc: 'Waterproof portable outdoor speaker with deep bass', price: 3499 },
    { name: 'Mechanical Keyboard', desc: 'Tactile mechanical keyboard with customizable RGB backlighting', price: 4499 },
    { name: 'Gaming Mouse', desc: 'High-precision optical gaming mouse with custom weights', price: 1899 },
    { name: '4K IPS Monitor', desc: 'Ultra HD screen panel optimized for designers and gamers', price: 24999 },
    { name: 'Fast Power Bank', desc: 'High-capacity external battery pack with dual output', price: 1499 },
    { name: 'USB-C Hub', desc: 'Multi-port aluminum adapter for laptop expansion', price: 1999 },
    { name: 'Webcam 4K', desc: 'Professional HD streaming camera with stereo microphone', price: 5499 },
    { name: 'Smart Socket Plug', desc: 'Wi-Fi enabled power outlet with energy tracking', price: 999 },
    { name: 'Fast Qi Wireless Charger', desc: 'Multi-device rapid wireless charging dock', price: 1499 }
  ],
  fashion: [
    { name: 'Organic Cotton Tee', desc: 'Soft and breathable 100% organic cotton t-shirt', price: 799 },
    { name: 'Athletic Sneakers', desc: 'Lightweight and cushioned running and walking shoes', price: 2999 },
    { name: 'Slim-Fit Denim Jeans', desc: 'Classic indigo stretch denim jeans with 5 pockets', price: 1899 },
    { name: 'Pullover Fleece Hoodie', desc: 'Warm and cozy hoodie with kangaroo pocket', price: 2499 },
    { name: 'Full-Grain Leather Belt', desc: 'Handcrafted genuine leather belt with steel buckle', price: 1299 },
    { name: 'Water-Resistant Backpack', desc: 'Durable travel and laptop pack with rain cover', price: 1999 },
    { name: 'Polarized Sunglasses', desc: 'Stylish UV400 protective polarized glasses', price: 1499 },
    { name: 'Modern Tailored Blazer', desc: 'Unstructured sport jacket for smart-casual wear', price: 4999 },
    { name: 'Merino Wool Knit Sweater', desc: 'Super-soft breathable wool knit sweater', price: 3499 },
    { name: 'Lightweight Chino Shorts', desc: 'Comfortable stretch cotton shorts for summer', price: 1199 },
    { name: 'RFID Bifold Wallet', desc: 'Genuine leather wallet with card security blocking', price: 999 },
    { name: 'Insulated Winter Parka', desc: 'Waterproof down-filled jacket for cold weather', price: 5999 }
  ],
  home: [
    { name: 'Non-Stick Cookware Set', desc: 'Professional anodized aluminum non-stick pots and pans', price: 4999 },
    { name: 'Robot Mapping Vacuum', desc: 'Lidar-guided automatic vacuum with smartphone controls', price: 15999 },
    { name: 'Drip Coffee Maker', desc: 'Programmable multi-cup thermal drip brewer', price: 2999 },
    { name: 'HEPA Air Purifier', desc: 'Quiet multi-stage allergen and odor remover', price: 8999 },
    { name: 'Eye-Care LED Desk Lamp', desc: 'Dimmable desk light with wireless charger base', price: 1499 },
    { name: 'Luxury Cotton Towel Set', desc: 'Highly absorbent long-staple cotton bath sheets', price: 1999 },
    { name: 'Aromatic Soy Candle', desc: 'Clean-burning essential oil scented soy candle', price: 699 },
    { name: 'Memory Foam Pillow', desc: 'Ergonomic cervical support sleeping pillow', price: 1299 },
    { name: 'Stainless Steel Kettle', desc: 'Double-walled rapid-boil electric water kettle', price: 1799 },
    { name: 'Chef Knife Block Set', desc: 'High-carbon forged kitchen knives in wooden stand', price: 3999 },
    { name: 'Flannel Fleece Throw', desc: 'Super-soft decorative warm couch blanket', price: 1199 },
    { name: 'Multi-Drawer Organizer', desc: 'Modular storage bins for closets and offices', price: 1499 }
  ],
  beauty: [
    { name: 'Brightening Vitamin C Serum', desc: 'Antioxidant serum that fades dark spots and evens skin tone', price: 899 },
    { name: 'Broad-Spectrum Sunscreen', desc: 'Non-greasy SPF 50 sunscreen with hyaluronic acid', price: 649 },
    { name: 'Charcoal Clay Mask', desc: 'Pore-clearing detoxifying mineral facial mask', price: 799 },
    { name: 'Foaming Daily Cleanser', desc: 'Gentle hydrating face wash for sensitive skin', price: 499 },
    { name: 'Peptide Eye Cream', desc: 'Anti-wrinkle dark circle reducing under-eye cream', price: 1299 },
    { name: 'Nourishing Argan Hair Oil', desc: 'Restorative split-end repairing cold-pressed hair oil', price: 599 },
    { name: 'Whipped Shea Body Butter', desc: 'Intensive moisture body lotion for dry skin', price: 899 },
    { name: 'Apricot Exfoliating Scrub', desc: 'Deep-cleaning facial scrub with natural micro-beads', price: 449 },
    { name: 'Rose Water Toner', desc: 'Hydrating and balancing facial mist spray', price: 399 },
    { name: 'Beeswax Lip Balm', desc: 'Soothing cracked-lip repairing natural balm pack', price: 249 },
    { name: 'Oil-Free Daily Moisturizer', desc: 'Lightweight quick-absorbing face hydration cream', price: 749 },
    { name: 'Retinol Night Cream', desc: 'Overnight cellular renewal anti-aging cream', price: 1499 }
  ],
  sports: [
    { name: 'Anti-Slip Yoga Mat', desc: 'High-density cushioned eco-friendly exercise mat', price: 999 },
    { name: 'Adjustable Dumbbell Set', desc: 'Quick-adjust dial-weight dumbbells for home workouts', price: 6999 },
    { name: 'Resistance Band Set', desc: 'Heavy-duty workout bands with door anchor and handles', price: 799 },
    { name: 'Insulated Water Flask', desc: 'Double-walled stainless steel vacuum sports bottle', price: 1199 },
    { name: 'Steel Cable Speed Rope', desc: 'Fully adjustable bearing jump rope for cardio', price: 499 },
    { name: 'Athletic Duffle Gym Bag', desc: 'Waterproof gym bag with separate shoe compartment', price: 1599 },
    { name: 'Muscle Trigger Foam Roller', desc: 'Grid-textured roller for deep tissue massage and recovery', price: 899 },
    { name: 'Carbon Fiber Badminton Racket', desc: 'Ultra-light high-tension racquet with carrying case', price: 1999 },
    { name: 'Hand Grip Trainer', desc: 'Adjustable tension finger and forearm exerciser', price: 399 },
    { name: 'Weighted Ankle Straps', desc: 'Comfortable padded ankle weights for leg exercises', price: 899 },
    { name: '3-Person Camping Tent', desc: 'Waterproof double-layer easy-setup outdoor tent', price: 4999 },
    { name: 'Trekking Backpack', desc: 'Ergonomic internal frame travel hiking pack', price: 3499 }
  ],
  books: [
    { name: 'Software Architecture Guide', desc: 'Deep dive into building highly scalable enterprise software systems', price: 599 },
    { name: 'Epic Space Opera Novel', desc: 'A thrilling science fiction adventure across distant star systems', price: 399 },
    { name: 'Innovator Biography', desc: 'The untold story of the struggles and triumphs of a modern visionary', price: 499 },
    { name: 'Plant-Based Cookbook', desc: 'Simple, delicious, and healthy vegetarian recipes for daily cooking', price: 449 },
    { name: 'Atomic Habits Masterclass', desc: 'A practical guide on building good habits and breaking bad ones', price: 349 },
    { name: 'Investing & Wealth Strategies', desc: 'Simple strategies to build long-term generational wealth and freedom', price: 399 },
    { name: 'Ancient Civilizations History', desc: 'A comprehensive study of the rise and fall of ancient societies', price: 499 },
    { name: 'Detective Thriller Story', desc: 'A suspenseful crime mystery that will keep you guessing till the end', price: 349 },
    { name: 'Creative Writing Lessons', desc: 'Practical prompts and exercises to unlock your inner storytelling power', price: 399 },
    { name: 'Startup Business Playbook', desc: 'An actionable roadmap for launching and scaling high-growth businesses', price: 549 },
    { name: 'Human Behavior Psychology', desc: 'Intriguing research on why we do what we do and make choices', price: 449 },
    { name: 'Modern Graphic Design History', desc: 'A fully illustrated handbook on typography, colors, and layout principles', price: 899 }
  ],
  groceries: [
    { name: 'Aged Long-Grain Basmati Rice', desc: 'Premium quality aromatic white rice sourced from small farms', price: 699 },
    { name: 'Extra Virgin Cold-Pressed Olive Oil', desc: 'Authentic organic olive oil imported from Spanish groves', price: 999 },
    { name: 'Loose-Leaf Organic Green Tea', desc: 'Antioxidant-rich organic green tea leaves for brewing', price: 399 },
    { name: 'Pure Unfiltered Forest Honey', desc: 'Raw, unpasteurized natural honey collected from wild bees', price: 499 },
    { name: 'Raw California Almonds', desc: 'Premium, crunchy, unsalted high-protein snack nuts', price: 799 },
    { name: 'Gluten-Free Rolled Oats', desc: '100% whole grain rolled oats perfect for a healthy breakfast', price: 299 },
    { name: 'Arabica Whole Coffee Beans', desc: 'Single-origin medium-roasted beans with notes of dark chocolate', price: 899 },
    { name: 'Unsweetened Peanut Butter', desc: 'All-natural ground roasted peanut spread with zero oils added', price: 349 },
    { name: 'Organic 85% Cacao Dark Chocolate', desc: 'Rich, gourmet dark chocolate bar crafted by master chocolatiers', price: 249 },
    { name: 'Gourmet Indian Spice Pack', desc: 'Collection of freshly ground organic turmeric, cumin, and coriander', price: 499 },
    { name: 'Nutrient-Dense Chia Seeds', desc: 'High-fiber organic black chia seeds for smoothies and puddings', price: 399 },
    { name: 'Organic White Quinoa Grains', desc: 'Pre-washed saponin-free high-protein quinoa grains', price: 449 }
  ]
};

// Generate 75 products for each category (75 * 7 = 525 products total)
const generatedProducts = [];
const categories = Object.keys(TEMPLATES);

for (const category of categories) {
  const templates = TEMPLATES[category];
  const images = IMAGE_POOLS[category];
  
  for (let i = 0; i < 75; i++) {
    // Select base template, brand, color, adjective, and features sequentially to avoid repeats and ensure variety
    const template = templates[i % templates.length];
    const brand = BRANDS[i % BRANDS.length];
    const adjective = ADJECTIVES[i % ADJECTIVES.length];
    const color = COLORS[i % COLORS.length];
    const feature = FEATURES[i % FEATURES.length];
    const extraFeature = EXTRA_FEATURES[i % EXTRA_FEATURES.length];
    const image = images[i % images.length];

    // Build unique product name
    // e.g. "Apex Premium Wireless Headphones - Midnight Black"
    const name = `${brand} ${adjective} ${template.name} (${color})`;

    // Build descriptive details
    const description = `${template.desc}. Crafted for ${feature}, this product comes complete with ${extraFeature}.`;

    // Apply random variations to price (between -10% and +25%)
    const priceModifier = 0.9 + (i % 35) * 0.01;
    const finalPrice = Math.round(template.price * priceModifier);

    // Set original price higher to show a discount (markup 20% to 65%)
    const originalPrice = Math.round(finalPrice * (1.2 + (i % 10) * 0.05));

    // Generate random rating (3.9 to 4.9 stars)
    const rating = parseFloat((3.9 + (i % 11) * 0.1).toFixed(1));

    // Generate random reviews count (15 to 2500)
    const reviewsCount = 15 + i * 27 + (i % 5) * 113;

    // Set stock levels (15 to 135 items)
    const stock = 15 + (i % 12) * 10;

    // Feature some items (approx 10%)
    const featured = (i % 10 === 0);

    generatedProducts.push({
      name,
      description,
      price: finalPrice,
      original_price: originalPrice,
      category,
      image,
      stock,
      rating,
      reviews_count: reviewsCount,
      featured
    });
  }
}

console.log(`Generated ${generatedProducts.length} unique products.`);

async function main() {
  console.log('Starting seed process...');
  
  if (isLocalMode) {
    const DB_FILE = path.join(process.cwd(), 'data', 'local_db.json');
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let currentDb = { products: [], users: [], cart_items: [], orders: [], order_items: [] };
    if (fs.existsSync(DB_FILE)) {
      try {
        currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      } catch (e) {
        // ignore
      }
    }
    
    const productsWithIds = generatedProducts.map((p, idx) => ({
      id: 100 + idx,
      created_at: new Date().toISOString(),
      ...p
    }));
    
    currentDb.products = productsWithIds;
    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2));
    console.log(`\nSuccess! Seeded a total of ${productsWithIds.length} products into local_db.json.`);
    process.exit(0);
  }

  // Batch insert products (we split into chunks of 100 to avoid any database request size limits)
  const chunkSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < generatedProducts.length; i += chunkSize) {
    const chunk = generatedProducts.slice(i, i + chunkSize);
    const { error } = await db.from('products').insert(chunk);
    
    if (error) {
      console.error(`Error inserting chunk starting at index ${i}:`, error.message);
      process.exit(1);
    }
    insertedCount += chunk.length;
    console.log(`Successfully inserted ${insertedCount}/${generatedProducts.length} products.`);
  }

  console.log(`\nSuccess! Seeded a total of ${insertedCount} products into Supabase.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Unexpected error during seeding:', err);
  process.exit(1);
});
