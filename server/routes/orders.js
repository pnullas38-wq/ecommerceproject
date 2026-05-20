const express = require('express');
const db = require('../database');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getCartItems(userId) {
  return db
    .prepare(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`
    )
    .all(userId);
}

router.get('/', (req, res) => {
  const orders = db
    .prepare(
      `SELECT id, total, status, payment_method, shipping_city, shipping_state, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);

  const withItems = orders.map((order) => ({
    ...order,
    items: db
      .prepare('SELECT product_name, price, quantity FROM order_items WHERE order_id = ?')
      .all(order.id),
  }));

  res.json({ orders: withItems });
});

router.get('/:id', (req, res) => {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db
    .prepare('SELECT product_name, price, quantity FROM order_items WHERE order_id = ?')
    .all(order.id);

  res.json({ order: { ...order, items } });
});

router.post('/', (req, res) => {
  const {
    paymentMethod,
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPincode,
  } = req.body;

  if (
    !paymentMethod ||
    !shippingName?.trim() ||
    !shippingPhone?.trim() ||
    !shippingAddress?.trim() ||
    !shippingCity?.trim() ||
    !shippingState?.trim() ||
    !shippingPincode?.trim()
  ) {
    return res.status(400).json({ error: 'Complete shipping and payment details are required' });
  }

  const cartItems = getCartItems(req.user.id);
  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({
        error: `Only ${item.stock} left in stock for ${item.name}`,
      });
    }
  }

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = total >= 499 ? 0 : 40;
  const orderTotal = total + shipping;

  const placeOrder = db.transaction(() => {
    const orderResult = db
      .prepare(
        `INSERT INTO orders (
          user_id, total, payment_method,
          shipping_name, shipping_phone, shipping_address,
          shipping_city, shipping_state, shipping_pincode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.user.id,
        orderTotal,
        paymentMethod,
        shippingName.trim(),
        shippingPhone.trim(),
        shippingAddress.trim(),
        shippingCity.trim(),
        shippingState.trim(),
        shippingPincode.trim()
      );

    const orderId = orderResult.lastInsertRowid;
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)'
    );
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.name, item.price, item.quantity);
      updateStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return orderId;
  });

  try {
    const orderId = placeOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const items = db
      .prepare('SELECT product_name, price, quantity FROM order_items WHERE order_id = ?')
      .all(orderId);

    res.status(201).json({
      order: { ...order, items },
      message: 'Order placed successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not place order' });
  }
});

module.exports = router;
