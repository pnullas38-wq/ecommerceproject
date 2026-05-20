const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search, featured, limit = '50', offset = '0' } = req.query;
  let sql = 'SELECT * FROM products WHERE stock > 0';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search?.trim()) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }
  if (featured === '1') {
    sql += ' AND featured = 1';
  }

  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit) || 50, Number(offset) || 0);

  const products = db.prepare(sql).all(...params);
  res.json({ products });
});

router.get('/categories', (_req, res) => {
  const rows = db
    .prepare('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category')
    .all();
  res.json({ categories: rows });
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

module.exports = router;
