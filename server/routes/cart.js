const express = require('express');
const db = require('../database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getCartItems(userId) {
  return db
    .prepare(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock, p.category
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(userId);
}

router.get('/', (req, res) => {
  const items = getCartItems(req.user.id);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json({ items, subtotal, itemCount: items.reduce((n, i) => n + i.quantity, 0) });
});

router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  const existing = db
    .prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);

  if (existing) {
    const newQty = Math.min(existing.quantity + qty, product.stock);
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      productId,
      qty
    );
  }

  const items = getCartItems(req.user.id);
  res.json({ items, message: 'Added to cart' });
});

router.patch('/:productId', (req, res) => {
  const { quantity } = req.body;
  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  const result = db
    .prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?')
    .run(qty, req.user.id, req.params.productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  res.json({ items: getCartItems(req.user.id) });
});

router.delete('/:productId', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    req.params.productId
  );
  res.json({ items: getCartItems(req.user.id) });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ items: [] });
});

module.exports = router;
