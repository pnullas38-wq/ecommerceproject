const API = '/api';
let token = localStorage.getItem('stuns_token');
let currentUser = JSON.parse(localStorage.getItem('stuns_user') || 'null');
let cartCount = 0;
let currentCategory = 'all';
let currentProduct = null;
let checkoutQty = 1;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function setAuth(t, user) {
  token = t;
  currentUser = user;
  if (t) {
    localStorage.setItem('stuns_token', t);
    localStorage.setItem('stuns_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('stuns_token');
    localStorage.removeItem('stuns_user');
  }
  updateAuthUI();
  refreshCartCount();
}

function updateAuthUI() {
  const btn = $('#account-btn');
  if (currentUser) {
    btn.textContent = `Hello, ${currentUser.name.split(' ')[0]}`;
    $('#orders-nav').style.display = 'inline-flex';
  } else {
    btn.textContent = 'Sign In';
    $('#orders-nav').style.display = 'none';
  }
}

function showPage(id) {
  $$('.page').forEach((p) => p.classList.remove('active'));
  $(`#${id}`).classList.add('active');
  window.scrollTo(0, 0);
}

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function discountPercent(price, original) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

function renderProductCard(p) {
  const disc = discountPercent(p.price, p.original_price);
  return `
    <article class="product-card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating"><span class="stars">★</span> ${p.rating} (${p.reviews_count})</div>
        <div class="price-row">
          <span class="price">${formatPrice(p.price)}</span>
          ${p.original_price ? `<span class="original-price">${formatPrice(p.original_price)}</span>` : ''}
          ${disc ? `<span class="discount-badge">${disc}% off</span>` : ''}
        </div>
        <button class="btn btn-primary add-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    </article>`;
}

async function loadProducts({ category, search, featured, target }) {
  const el = $(target);
  el.innerHTML = '<p class="loading">Loading products…</p>';
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    if (featured) params.set('featured', '1');
    const { products } = await api(`/products?${params}`);
    if (!products.length) {
      el.innerHTML = '<div class="empty-state"><h2>No products found</h2><p>Try another category or search.</p></div>';
      return;
    }
    el.innerHTML = products.map(renderProductCard).join('');
    bindProductCards(el);
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><h2>Error</h2><p>${e.message}</p></div>`;
  }
}

function bindProductCards(container) {
  container.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.add-cart-btn')) return;
      openProduct(Number(card.dataset.id));
    });
  });
  container.querySelectorAll('.add-cart-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await addToCart(Number(btn.dataset.id));
    });
  });
}

async function openProduct(id) {
  try {
    const { product } = await api(`/products/${id}`);
    currentProduct = product;
    checkoutQty = 1;
    $('#detail-img').src = product.image;
    $('#detail-img').alt = product.name;
    $('#detail-name').textContent = product.name;
    $('#detail-rating').innerHTML = `<span class="stars">★</span> ${product.rating} (${product.reviews_count} reviews)`;
    $('#detail-price').textContent = formatPrice(product.price);
    $('#detail-original').textContent = product.original_price
      ? formatPrice(product.original_price)
      : '';
    $('#detail-desc').textContent = product.description;
    $('#detail-stock').textContent =
      product.stock > 10
        ? 'In stock'
        : product.stock > 0
          ? `Only ${product.stock} left`
          : 'Out of stock';
    $('#detail-stock').className = product.stock > 10 ? 'stock-ok' : 'stock-low';
    $('#detail-qty').textContent = '1';
    $('#detail-add').disabled = product.stock < 1;
    showPage('product-page');
  } catch (e) {
    showToast(e.message);
  }
}

async function addToCart(productId, quantity = 1) {
  if (!token) {
    openAuthModal();
    showToast('Sign in to add items to cart');
    return;
  }
  try {
    await api('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
    showToast('Added to cart');
    refreshCartCount();
  } catch (e) {
    showToast(e.message);
  }
}

async function refreshCartCount() {
  if (!token) {
    cartCount = 0;
    $('#cart-count').textContent = '0';
    $('#cart-count').style.display = 'none';
    return;
  }
  try {
    const { itemCount } = await api('/cart');
    cartCount = itemCount;
    $('#cart-count').textContent = itemCount;
    $('#cart-count').style.display = itemCount ? 'flex' : 'none';
  } catch {
    cartCount = 0;
  }
}

async function loadCartPage() {
  const list = $('#cart-list');
  if (!token) {
    list.innerHTML =
      '<div class="empty-state"><h2>Sign in to view cart</h2><button class="btn btn-primary" id="cart-signin">Sign In</button></div>';
    $('#cart-signin')?.addEventListener('click', openAuthModal);
    return;
  }
  list.innerHTML = '<p class="loading">Loading cart…</p>';
  try {
    const { items, subtotal } = await api('/cart');
    if (!items.length) {
      list.innerHTML =
        '<div class="empty-state"><h2>Your cart is empty</h2><p>Browse products and add something you like.</p><button class="btn btn-primary" id="shop-now">Shop Now</button></div>';
      $('#shop-now').addEventListener('click', () => showPage('home-page'));
      $('#checkout-summary').innerHTML = '';
      return;
    }
    const shipping = subtotal >= 499 ? 0 : 40;
    const total = subtotal + shipping;
    list.innerHTML = items
      .map(
        (i) => `
      <div class="cart-item" data-id="${i.product_id}">
        <img src="${i.image}" alt="${i.name}">
        <div class="cart-item-info">
          <strong>${i.name}</strong>
          <p>${formatPrice(i.price)} × ${i.quantity}</p>
          <div class="qty-control">
            <button class="cart-dec" data-id="${i.product_id}">−</button>
            <span>${i.quantity}</span>
            <button class="cart-inc" data-id="${i.product_id}" ${i.quantity >= i.stock ? 'disabled' : ''}>+</button>
          </div>
          <button class="remove-btn" data-id="${i.product_id}">Remove</button>
        </div>
        <strong>${formatPrice(i.price * i.quantity)}</strong>
      </div>`
      )
      .join('');

    $('#checkout-summary').innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping ? formatPrice(shipping) : 'FREE'}</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      <button class="btn btn-primary" id="go-checkout" style="width:100%;margin-top:16px">Proceed to Checkout</button>`;

    list.querySelectorAll('.cart-dec').forEach((b) =>
      b.addEventListener('click', () => updateCartQty(b.dataset.id, -1, items))
    );
    list.querySelectorAll('.cart-inc').forEach((b) =>
      b.addEventListener('click', () => updateCartQty(b.dataset.id, 1, items))
    );
    list.querySelectorAll('.remove-btn').forEach((b) =>
      b.addEventListener('click', () => removeFromCart(b.dataset.id))
    );
    $('#go-checkout').addEventListener('click', () => {
      if (!token) return openAuthModal();
      showPage('checkout-page');
      loadCheckoutSummary();
    });
  } catch (e) {
    list.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

async function updateCartQty(productId, delta, items) {
  const item = items.find((i) => i.product_id === Number(productId));
  const newQty = item.quantity + delta;
  if (newQty < 1) return removeFromCart(productId);
  try {
    await api(`/cart/${productId}`, { method: 'PATCH', body: JSON.stringify({ quantity: newQty }) });
    loadCartPage();
    refreshCartCount();
  } catch (e) {
    showToast(e.message);
  }
}

async function removeFromCart(productId) {
  try {
    await api(`/cart/${productId}`, { method: 'DELETE' });
    loadCartPage();
    refreshCartCount();
    showToast('Removed from cart');
  } catch (e) {
    showToast(e.message);
  }
}

async function loadCheckoutSummary() {
  try {
    const { items, subtotal } = await api('/cart');
    const shipping = subtotal >= 499 ? 0 : 40;
    $('#checkout-items').innerHTML = items
      .map((i) => `<p class="order-item-line">${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}</p>`)
      .join('');
    $('#checkout-total').textContent = formatPrice(subtotal + shipping);
  } catch (e) {
    showToast(e.message);
  }
}

async function placeOrder(e) {
  e.preventDefault();
  if (!token) return openAuthModal();
  const form = e.target;
  const paymentMethod = form.querySelector('input[name="payment"]:checked')?.value;
  const body = {
    paymentMethod,
    shippingName: form.name.value,
    shippingPhone: form.phone.value,
    shippingAddress: form.address.value,
    shippingCity: form.city.value,
    shippingState: form.state.value,
    shippingPincode: form.pincode.value,
  };
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  try {
    const { order } = await api('/orders', { method: 'POST', body: JSON.stringify(body) });
    showPage('confirmation-page');
    $('#confirm-id').textContent = order.id;
    $('#confirm-total').textContent = formatPrice(order.total);
    refreshCartCount();
    form.reset();
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
  }
}

async function loadOrders() {
  const el = $('#orders-list');
  if (!token) {
    el.innerHTML = '<div class="empty-state"><h2>Sign in to view orders</h2></div>';
    return;
  }
  el.innerHTML = '<p class="loading">Loading orders…</p>';
  try {
    const { orders } = await api('/orders');
    if (!orders.length) {
      el.innerHTML = '<div class="empty-state"><h2>No orders yet</h2><p>Your order history will appear here.</p></div>';
      return;
    }
    el.innerHTML = orders
      .map(
        (o) => `
      <div class="order-card">
        <div class="order-header">
          <div><strong>Order #${o.id}</strong><br><small>${new Date(o.created_at).toLocaleString()}</small></div>
          <span class="order-status">${o.status}</span>
        </div>
        ${o.items.map((i) => `<p class="order-item-line">${i.product_name} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}</p>`).join('')}
        <p style="margin-top:12px;font-weight:700">Total: ${formatPrice(o.total)} · ${o.payment_method} · ${o.shipping_city}</p>
      </div>`
      )
      .join('');
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
  }
}

function openAuthModal() {
  $('#auth-modal').classList.add('show');
}

function closeAuthModal() {
  $('#auth-modal').classList.remove('show');
  $('#auth-error').classList.remove('show');
}

async function handleAuth(e) {
  e.preventDefault();
  const isLogin = $('#auth-tab-login').classList.contains('active');
  const err = $('#auth-error');
  err.classList.remove('show');
  const body = isLogin
    ? { email: $('#auth-email').value, password: $('#auth-password').value }
    : {
        name: $('#auth-name').value,
        email: $('#auth-email').value,
        password: $('#auth-password').value,
      };
  try {
    const data = await api(isLogin ? '/auth/login' : '/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setAuth(data.token, data.user);
    closeAuthModal();
    showToast(isLogin ? 'Welcome back!' : 'Account created!');
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.add('show');
  }
}

function logout() {
  setAuth(null, null);
  showToast('Signed out');
  showPage('home-page');
}

async function init() {
  updateAuthUI();
  refreshCartCount();

  await loadProducts({ target: '#featured-products', featured: true });
  await loadProducts({ target: '#all-products', category: currentCategory });

  $('#logo').addEventListener('click', () => {
    showPage('home-page');
    loadProducts({ target: '#all-products', category: 'all' });
  });

  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#search-input').value.trim();
    showPage('home-page');
    loadProducts({ target: '#all-products', search: q });
    $('.section-title-all').textContent = q ? `Results for "${q}"` : 'All Products';
  });

  $$('.cat-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.cat-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category;
      showPage('home-page');
      loadProducts({ target: '#all-products', category: currentCategory });
    });
  });

  $('#account-btn').addEventListener('click', () => {
    if (currentUser) {
      if (confirm('Sign out?')) logout();
    } else openAuthModal();
  });

  $('#cart-btn').addEventListener('click', () => {
    showPage('cart-page');
    loadCartPage();
  });

  $('#orders-nav').addEventListener('click', () => {
    showPage('orders-page');
    loadOrders();
  });

  $('#detail-back').addEventListener('click', () => showPage('home-page'));
  $('#detail-dec').addEventListener('click', () => {
    if (checkoutQty > 1) {
      checkoutQty--;
      $('#detail-qty').textContent = checkoutQty;
    }
  });
  $('#detail-inc').addEventListener('click', () => {
    if (currentProduct && checkoutQty < currentProduct.stock) {
      checkoutQty++;
      $('#detail-qty').textContent = checkoutQty;
    }
  });
  $('#detail-add').addEventListener('click', () => addToCart(currentProduct.id, checkoutQty));

  $('#checkout-form').addEventListener('submit', placeOrder);
  $('#checkout-back').addEventListener('click', () => {
    showPage('cart-page');
    loadCartPage();
  });

  $('#modal-close').addEventListener('click', closeAuthModal);
  $('#auth-modal').addEventListener('click', (e) => {
    if (e.target === $('#auth-modal')) closeAuthModal();
  });
  $('#auth-form').addEventListener('submit', handleAuth);

  $('#auth-tab-login').addEventListener('click', () => {
    $('#auth-tab-login').classList.add('active');
    $('#auth-tab-register').classList.remove('active');
    $('#auth-name-group').style.display = 'none';
    $('#auth-title').textContent = 'Sign In';
  });
  $('#auth-tab-register').addEventListener('click', () => {
    $('#auth-tab-register').classList.add('active');
    $('#auth-tab-login').classList.remove('active');
    $('#auth-name-group').style.display = 'block';
    $('#auth-title').textContent = 'Create Account';
  });

  $('#confirm-continue').addEventListener('click', () => {
    showPage('home-page');
    loadProducts({ target: '#all-products', category: currentCategory });
  });
}

init();
