import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'local_db.json');

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Wireless Bluetooth Headphones', description: 'Noise-cancelling over-ear headphones with 30hr battery.', price: 2499, original_price: 4999, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', stock: 45, rating: 4.6, reviews_count: 1284, featured: true },
  { id: 2, name: 'Smart Watch Series X', description: 'Fitness tracking, GPS, 7-day battery.', price: 3999, original_price: 7999, category: 'electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', stock: 32, rating: 4.4, reviews_count: 892, featured: true },
  { id: 3, name: "Men's Casual Cotton T-Shirt", description: '100% organic cotton, breathable fit.', price: 599, original_price: 999, category: 'fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', stock: 120, rating: 4.3, reviews_count: 456, featured: true },
  { id: 4, name: "Women's Running Shoes", description: 'Lightweight mesh with cushioned sole.', price: 1899, original_price: 3499, category: 'fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', stock: 58, rating: 4.7, reviews_count: 2103, featured: true },
  { id: 5, name: 'Stainless Steel Cookware Set', description: '10-piece non-stick set, oven-safe.', price: 3499, original_price: 5999, category: 'home', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', stock: 25, rating: 4.5, reviews_count: 678, featured: false },
  { id: 6, name: 'Robot Vacuum Cleaner', description: 'Smart mapping, 120 min runtime.', price: 12999, original_price: 18999, category: 'home', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop', stock: 18, rating: 4.2, reviews_count: 334, featured: true },
  { id: 7, name: 'Vitamin C Face Serum', description: 'Brightening serum with hyaluronic acid.', price: 799, original_price: 1299, category: 'beauty', image: 'https://images.unsplash.com/photo-1620916564555-4e7eeef5770a?w=400&h=400&fit=crop', stock: 90, rating: 4.8, reviews_count: 1567, featured: false },
  { id: 8, name: 'Yoga Mat Premium', description: '6mm anti-slip eco TPE mat.', price: 899, original_price: 1499, category: 'sports', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', stock: 75, rating: 4.6, reviews_count: 445, featured: false },
  { id: 9, name: 'Adjustable Dumbbell Set', description: '5–25 kg quick-lock dumbbells.', price: 4999, original_price: 7999, category: 'sports', image: 'https://images.unsplash.com/photo-1583454110551-21f2d2b7fb1a?w=400&h=400&fit=crop', stock: 22, rating: 4.5, reviews_count: 289, featured: true },
  { id: 10, name: 'The Art of Programming', description: 'Guide to clean code and design patterns.', price: 449, original_price: 699, category: 'books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', stock: 200, rating: 4.9, reviews_count: 3421, featured: false },
  { id: 11, name: 'Organic Basmati Rice 5kg', description: 'Premium aged basmati rice.', price: 649, original_price: 899, category: 'groceries', image: 'https://images.unsplash.com/photo-1586201375767-2fccffdb803e?w=400&h=400&fit=crop', stock: 150, rating: 4.7, reviews_count: 892, featured: false },
  { id: 12, name: 'Car Phone Mount', description: 'Magnetic 360° dashboard mount.', price: 399, original_price: 799, category: 'automotive', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop', stock: 85, rating: 4.1, reviews_count: 156, featured: false },
  { id: 13, name: '4K Ultra HD Smart TV 55"', description: 'Dolby Vision Android TV.', price: 42999, original_price: 59999, category: 'electronics', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=400&fit=crop', stock: 12, rating: 4.5, reviews_count: 567, featured: true },
  { id: 14, name: 'Leather Wallet', description: 'RFID blocking genuine leather.', price: 1299, original_price: 2499, category: 'fashion', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop', stock: 64, rating: 4.4, reviews_count: 234, featured: false },
  { id: 15, name: 'Air Purifier HEPA', description: '99.97% allergen removal, 400 sq ft.', price: 8999, original_price: 12999, category: 'home', image: 'https://images.unsplash.com/photo-1585771724684-fa180fbfab3a?w=400&h=400&fit=crop', stock: 30, rating: 4.6, reviews_count: 412, featured: true },
  { id: 16, name: 'Sunscreen SPF 50', description: 'Broad spectrum, water resistant.', price: 549, original_price: 799, category: 'beauty', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', stock: 110, rating: 4.7, reviews_count: 789, featured: false }
];

function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(
        {
          products: DEFAULT_PRODUCTS,
          users: [],
          cart_items: [],
          orders: [],
          order_items: [],
        },
        null,
        2
      )
    );
  } else {
    // If the file exists but has no products, populate with defaults
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (!data.products || data.products.length === 0) {
        data.products = DEFAULT_PRODUCTS;
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      }
    } catch {
      // ignore
    }
  }
}

function readTable(table: string): any[] {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return data[table] || [];
  } catch {
    return [];
  }
}

function writeTable(table: string, tableData: any[]) {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    data[table] = tableData;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local DB:', e);
  }
}

class LocalQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAscending = true;
  private rangeStart = 0;
  private rangeEnd = -1;
  private singleRequested = false;
  private maybeSingleRequested = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*', options?: { count?: string; head?: boolean }) {
    if (options?.head) {
      return {
        then: (resolve: any) => {
          const data = readTable(this.table);
          resolve({ count: data.length, error: null });
        },
      };
    }
    return this;
  }

  insert(rows: any | any[]) {
    return {
      then: (resolve: any) => {
        try {
          const data = readTable(this.table);
          const isArray = Array.isArray(rows);
          const toInsert = isArray ? rows : [rows];
          
          const newRows = toInsert.map((row, idx) => {
            const newRow = {
              id: Date.now() + Math.floor(Math.random() * 1000000) + idx,
              created_at: new Date().toISOString(),
              ...row,
            };
            if (newRow.price !== undefined) newRow.price = Number(newRow.price);
            if (newRow.original_price !== undefined) newRow.original_price = Number(newRow.original_price);
            if (newRow.stock !== undefined) newRow.stock = Number(newRow.stock);
            if (newRow.rating !== undefined) newRow.rating = Number(newRow.rating);
            if (newRow.reviews_count !== undefined) newRow.reviews_count = Number(newRow.reviews_count);
            return newRow;
          });

          data.push(...newRows);
          writeTable(this.table, data);
          
          resolve({
            data: isArray ? newRows : newRows[0],
            error: null,
          });
        } catch (e: any) {
          resolve({ data: null, error: { message: e.message } });
        }
      },
    };
  }

  update(updates: any) {
    return {
      eq: (col: string, val: any) => {
        this.eq(col, val);
        return {
          select: () => {
            return {
              single: () => {
                return {
                  then: (resolve: any) => {
                    try {
                      const data = readTable(this.table);
                      const index = data.findIndex((item: any) => {
                        return this.filters.every((f) => f(item));
                      });
                      if (index === -1) {
                        return resolve({ data: null, error: { message: 'Row not found' } });
                      }
                      data[index] = { ...data[index], ...updates };
                      writeTable(this.table, data);
                      resolve({ data: data[index], error: null });
                    } catch (e: any) {
                      resolve({ data: null, error: { message: e.message } });
                    }
                  },
                };
              },
            };
          },
          then: (resolve: any) => {
            try {
              const data = readTable(this.table);
              const updatedData = data.map((item: any) => {
                if (this.filters.every((f) => f(item))) {
                  return { ...item, ...updates };
                }
                return item;
              });
              writeTable(this.table, updatedData);
              resolve({
                data: updatedData.filter((item: any) => this.filters.every((f) => f(item))),
                error: null,
              });
            } catch (e: any) {
              resolve({ data: null, error: { message: e.message } });
            }
          },
        };
      },
    };
  }

  delete() {
    return {
      eq: (col: string, val: any) => {
        this.eq(col, val);
        const chain = {
          eq: (col2: string, val2: any) => {
            this.eq(col2, val2);
            return chain;
          },
          then: (resolve: any) => {
            try {
              const data = readTable(this.table);
              const remaining = data.filter((item: any) => {
                return !this.filters.every((f) => f(item));
              });
              writeTable(this.table, remaining);
              resolve({ data: true, error: null });
            } catch (e: any) {
              resolve({ data: null, error: { message: e.message } });
            }
          },
        };
        return chain;
      },
    };
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      if (column === 'id' || column === 'user_id' || column === 'product_id' || column === 'order_id') {
        return Number(item[column]) === Number(value);
      }
      if (typeof item[column] === 'string' && typeof value === 'string') {
        return item[column].toLowerCase() === value.toLowerCase();
      }
      return item[column] === value;
    });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item: any) => {
      if (column === 'id' || column === 'user_id' || column === 'product_id' || column === 'order_id') {
        return Number(item[column]) !== Number(value);
      }
      return item[column] !== value;
    });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item: any) => {
      return Number(item[column]) > Number(value);
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAscending = ascending;
    return this;
  }

  range(start: number, end: number) {
    this.rangeStart = start;
    this.rangeEnd = end;
    return this;
  }

  single() {
    this.singleRequested = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleRequested = true;
    return this;
  }

  then(resolve: any, reject: any) {
    try {
      let data = readTable(this.table);

      if (this.filters.length > 0) {
        data = data.filter((item: any) => {
          return this.filters.every((f) => f(item));
        });
      }

      if (this.orderCol) {
        data.sort((a: any, b: any) => {
          let valA = a[this.orderCol!];
          let valB = b[this.orderCol!];
          if (typeof valA === 'string') valA = valA.toLowerCase();
          if (typeof valB === 'string') valB = valB.toLowerCase();
          if (valA < valB) return this.orderAscending ? -1 : 1;
          if (valA > valB) return this.orderAscending ? 1 : -1;
          return 0;
        });
      }

      if (this.rangeEnd !== -1) {
        data = data.slice(this.rangeStart, this.rangeEnd + 1);
      }

      if (this.singleRequested) {
        if (data.length === 0) {
          return resolve({ data: null, error: { message: 'Row not found' } });
        }
        return resolve({ data: data[0], error: null });
      }

      if (this.maybeSingleRequested) {
        return resolve({ data: data.length > 0 ? data[0] : null, error: null });
      }

      resolve({ data, error: null });
    } catch (e: any) {
      resolve({ data: null, error: { message: e.message } });
    }
  }
}

export function getLocalDb() {
  initDb();
  return {
    from: (table: string) => {
      return new LocalQueryBuilder(table);
    },
  };
}
