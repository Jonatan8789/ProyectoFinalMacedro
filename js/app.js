
/*
  app.js - Ecommerce simulador (Proyecto Final Macedro)
  - Carga products.json (simulado remoto)
  - Renderiza productos, carrito, checkout
  - Usa SweetAlert2 en lugar de alert/confirm/prompt
  - Guarda pedidos en localStorage (simulación de backend)
*/

// Variables de estado
const state = {
  products: [],
  cart: [], // {id, qty}
};

// Helpers (clear, named, reusable)
function formatPrice(value) {
  return '$' + Number(value).toLocaleString('es-AR');
}

function findProduct(id) {
  return state.products.find(p => p.id === Number(id));
}

function saveOrdersToLocalStorage(orders) {
  localStorage.setItem('sim_orders', JSON.stringify(orders || []));
}

function loadOrdersFromLocalStorage() {
  try {
    const raw = localStorage.getItem('sim_orders');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Fetch products (simulate remote JSON)
async function loadProducts() {
  try {
    const res = await fetch('../data/products.json');
    if (!res.ok) throw new Error('No se pudo cargar products.json');
    const data = await res.json();
    state.products = data;
    renderProducts();
  } catch (err) {
    document.getElementById('products-empty').classList.remove('hidden');
  }
}

// Render products into the DOM
function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';
  state.products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" loading="lazy" />
      <h3>${p.title}</h3>
      <div class="desc">${p.description}</div>
      <div class="price">${formatPrice(p.price)}</div>
      <div class="actions">
        <button class="btn add-btn" data-id="${p.id}">Agregar al carrito</button>
      </div>
    `;
    container.appendChild(card);
  });
  bindAddButtons();
}

// Event binding for add to cart
function bindAddButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      addToCart(Number(id), 1);
      Swal.fire({icon:'success', title:'Producto agregado', toast:true, position:'top-end', timer:1400, showConfirmButton:false});
    });
  });
}

// Cart logic
function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product) return;
  const existing = state.cart.find(item => item.id === id);
  const available = product.stock - (existing ? existing.qty : 0);
  if (available <= 0) {
    Swal.fire({icon:'error', title:'Sin stock disponible'});
    return;
  }
  if (existing) existing.qty = Math.min(product.stock, existing.qty + qty);
  else state.cart.push({id, qty: Math.min(product.stock, qty)});
  updateCartCount();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  renderCart();
  updateCartCount();
}

function changeQty(id, newQty) {
  const product = findProduct(id);
  if (!product) return;
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, Math.min(product.stock, Number(newQty)));
  renderCart();
  updateCartCount();
}

function cartTotal() {
  return state.cart.reduce((sum, it) => {
    const p = findProduct(it.id);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

function updateCartCount() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

// Render cart modal
function renderCart() {
  const modal = document.getElementById('cart-modal');
  const container = document.getElementById('cart-items');
  container.innerHTML = '';
  if (state.cart.length === 0) {
    container.innerHTML = '<div class="note">Carrito vacío</div>';
  } else {
    state.cart.forEach(item => {
      const p = findProduct(item.id);
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${p.image}" alt="${p.title}" />
        <div class="meta">
          <strong>${p.title}</strong><div class="desc">${formatPrice(p.price)} c/u</div>
          <div class="qty-controls">
            <button class="btn qty-decrease" data-id="${item.id}">-</button>
            <input class="qty-input" data-id="${item.id}" value="${item.qty}" size="2" />
            <button class="btn qty-increase" data-id="${item.id}">+</button>
            <button class="btn" data-remove="${item.id}">Eliminar</button>
          </div>
        </div>
        <div class="price">${formatPrice(p.price * item.qty)}</div>
      `;
      container.appendChild(div);
    });
    const summary = document.createElement('div');
    summary.className = 'note';
    summary.innerHTML = `<strong>Total: ${formatPrice(cartTotal())}</strong>`;
    container.appendChild(summary);
  }
  modal.classList.remove('hidden');
  bindCartButtons();
}

// Bind cart UI controls
function bindCartButtons() {
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(btn.getAttribute('data-remove'));
      removeFromCart(id);
    });
  });
  document.querySelectorAll('.qty-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const item = state.cart.find(i => i.id === id);
      if (item) changeQty(id, Math.max(1, item.qty - 1));
    });
  });
  document.querySelectorAll('.qty-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const item = state.cart.find(i => i.id === id);
      if (item) changeQty(id, Math.min(999, item.qty + 1));
    });
  });
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', () => {
      const id = Number(input.getAttribute('data-id'));
      changeQty(id, Number(input.value));
    });
  });
}

// Checkout flow
function openCheckout() {
  if (state.cart.length === 0) {
    Swal.fire({icon:'info', title:'El carrito está vacío'});
    return;
  }
  document.getElementById('cart-modal').classList.add('hidden');
  document.getElementById('checkout-modal').classList.remove('hidden');
  // precargar datos en el formulario (sugerido en el enunciado)
  document.getElementById('fullname').value = 'Juan Pérez';
  document.getElementById('email').value = 'juan.perez@example.com';
  document.getElementById('address').value = 'Calle Falsa 123, Ciudad';
}

// Simulate payment / finalize order
function finalizeOrder(formData) {
  const orders = loadOrdersFromLocalStorage();
  const orderId = 'ORD' + Date.now();
  const items = state.cart.map(i => ({...i, title: findProduct(i.id).title, price: findProduct(i.id).price}));
  const order = {
    id: orderId,
    buyer: formData,
    items,
    total: cartTotal(),
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  saveOrdersToLocalStorage(orders);
  // Decrement stock locally (simulate server update)
  order.items.forEach(it => {
    const p = findProduct(it.id);
    if (p) p.stock = Math.max(0, p.stock - it.qty);
  });
  // Clear cart
  state.cart = [];
  updateCartCount();
  renderProducts();
  document.getElementById('checkout-modal').classList.add('hidden');
  Swal.fire({
    icon:'success',
    title:'Compra exitosa',
    html:`<strong>Pedido:</strong> ${orderId}<br/><strong>Total:</strong> ${formatPrice(order.total)}`
  });
}

// Initialization and UI wiring
function init() {
  // Buttons
  document.getElementById('view-cart-btn').addEventListener('click', renderCart);
  document.getElementById('continue-shopping').addEventListener('click', () => {
    document.getElementById('cart-modal').classList.add('hidden');
  });
  document.getElementById('checkout-btn').addEventListener('click', openCheckout);
  document.getElementById('back-to-cart').addEventListener('click', () => {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('cart-modal').classList.remove('hidden');
  });
  document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      fullname: form.fullname.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      payment: form.payment.value
    };
    // Simple validation
    if (!data.fullname || !data.email) {
      Swal.fire({icon:'error', title:'Complete los campos requeridos'});
      return;
    }
    // Simulate payment confirmation
    Swal.fire({
      title: 'Confirmar pago',
      html: `Total a pagar: <strong>${formatPrice(cartTotal())}</strong>`,
      showCancelButton: true,
      confirmButtonText: 'Pagar ahora'
    }).then(result => {
      if (result.isConfirmed) {
        finalizeOrder(data);
      }
    });
  });

  // Load data
  loadProducts();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
