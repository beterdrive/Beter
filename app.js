let products = [];
let cart = JSON.parse(localStorage.getItem('sadeghaneh_cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    products = await response.json();
    renderProducts();
    updateCartUI();
  } catch (error) {
    console.error('خطا در بارگذاری محصولات:', error);
    document.getElementById('productsGrid').innerHTML =
      '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#ef4444;">خطا در بارگذاری محصولات</p>';
  }
}

function formatPrice(num) {
  return num.toLocaleString('fa-IR') + ' تومان';
}

function saveCart() {
  localStorage.setItem('sadeghaneh_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartBadge');
  const navBadge = document.getElementById('navBadge');
  badge.textContent = count;
  navBadge.textContent = count;
  badge.style.display = count ? 'flex' : 'none';
  navBadge.style.display = count ? 'flex' : 'none';

  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-bag"></i>
        <p>سبد خرید شما خالی است</p>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = products.find(pr => pr.id === item.id);
    if (!p) return '';
    total += p.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <div class="price">${formatPrice(p.price)}</div>
          <div class="cart-item-qty">
            <button onclick="changeQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
            <button onclick="removeFromCart(${item.id})" style="margin-right:auto;color:#ef4444;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function openCart() {
  document.getElementById('cartOverlay').classList.add('active');
  document.getElementById('cartDrawer').classList.add('active');
  setActiveNav('cart');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('active');
  document.getElementById('cartDrawer').classList.remove('active');
}

function checkout() {
  alert('این یک سایت دمو است.\nدر نسخه واقعی به درگاه پرداخت متصل می‌شود.');
}

function renderProducts() {
  let list = products;
  if (currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
  if (searchQuery) {
    list = list.filter(p =>
      p.name.includes(searchQuery) || p.category.includes(searchQuery) || p.desc.includes(searchQuery)
    );
  }
  document.getElementById('productCount').textContent = list.length + ' محصول';
  const grid = document.getElementById('productsGrid');
  if (list.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#64748b;">محصولی یافت نشد</p>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.price < 200000 ? '<span class="product-badge">پیشنهادی</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-bottom">
          <div class="product-price">${formatPrice(p.price)}</div>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
  renderProducts();
}

function filterProducts() {
  searchQuery = document.getElementById('searchInput').value.trim();
  renderProducts();
}

function openProduct(id) {
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  document.getElementById('modalBody').innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="modal-details">
      <div class="product-cat">${p.category}</div>
      <h2>${p.name}</h2>
      <div class="price">${formatPrice(p.price)}</div>
      <p>${p.desc}</p>
      <button class="modal-add" onclick="addToCart(${p.id}); closeModal();">
        <i class="fas fa-shopping-bag"></i> افزودن به سبد خرید
      </button>
    </div>
  `;
  document.getElementById('productModal').classList.add('active');
}

function closeModal() {
  document.getElementById('productModal').classList.remove('active');
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

function showHome() {
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('products').classList.remove('hidden');
  document.querySelector('.categories').classList.remove('hidden');
  document.getElementById('accountPage').style.display = 'none';
  document.querySelector('.footer').classList.remove('hidden');
  setActiveNav('home');
  closeCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAccount() {
  document.getElementById('hero').classList.add('hidden');
  document.getElementById('products').classList.add('hidden');
  document.querySelector('.categories').classList.add('hidden');
  document.querySelector('.footer').classList.add('hidden');
  document.getElementById('accountPage').style.display = 'block';
  setActiveNav('account');
  closeCart();
}

function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('active');
  if (bar.classList.contains('active')) {
    document.getElementById('searchInput').focus();
  } else {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    renderProducts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

document.getElementById('productModal').addEventListener('click', (e) => {
  if (e.target.id === 'productModal') closeModal();
});
