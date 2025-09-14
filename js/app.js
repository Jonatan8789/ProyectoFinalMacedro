
// --- Modelo de datos -----------------------------------------------------
class Product {
  constructor(id, name, price, description = '') {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.description = description;
  }
}

class CartItem {
  constructor(product, qty=1) {
    this.product = product;
    this.qty = Number(qty);
  }
  subtotal(){ return this.product.price * this.qty }
}


const STORAGE_KEY = "simulator_cart_v1";
let products = []; // array de Productos
let cart = [];     // array de carrito


function formatMoney(n){
  return Number(n).toFixed(2);
}

function saveCart(){
  const serial = cart.map(ci => ({id:ci.product.id, qty:ci.qty}));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serial));
}

function loadCart(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    const arr = JSON.parse(raw);
    cart = arr.map(a=>{
      const p = products.find(x=>x.id===a.id);
      if(p) return new CartItem(p, a.qty);
      return null;
    }).filter(Boolean);
  }catch(e){
    cart = [];
  }
}


const tplProduct = document.getElementById('product-template');
const tplCartItem = document.getElementById('cart-item-template');

function renderProducts(){
  const container = document.getElementById('product-list');
  container.innerHTML = '';
  products.forEach(p=>{
    const node = tplProduct.content.cloneNode(true);
    node.querySelector('.p-name').textContent = p.name;
    node.querySelector('.p-desc').textContent = p.description;
    node.querySelector('.p-price').textContent = '$' + formatMoney(p.price);
    const qtyInput = node.querySelector('.p-qty');
    qtyInput.value = 1;
    node.querySelector('.btn-add').addEventListener('click', ()=>{
      const qty = Number(qtyInput.value) || 1;
      addToCart(p.id, qty);
    });
    container.appendChild(node);
  });
}

function renderCart(){
  const list = document.getElementById('cart-list');
  list.innerHTML = '';
  cart.forEach(ci=>{
    const node = tplCartItem.content.cloneNode(true);
    node.querySelector('.ci-name').textContent = ci.product.name;
    node.querySelector('.ci-price').textContent = '$' + formatMoney(ci.product.price) + ' c/u';
    const qtyInput = node.querySelector('.ci-qty');
    qtyInput.value = ci.qty;
    qtyInput.addEventListener('change', (e)=>{
      const v = Number(e.target.value);
      if(v <= 0){ removeFromCart(ci.product.id); return; }
      updateQty(ci.product.id, v);
    });
    node.querySelector('.ci-remove').addEventListener('click', ()=> removeFromCart(ci.product.id));
    list.appendChild(node);
  });


  const count = cart.reduce((s,i)=>s + i.qty,0);
  const total = cart.reduce((s,i)=>s + i.subtotal(),0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = formatMoney(total);
}


function addToCart(productId, qty=1){
  const product = products.find(p=>p.id===productId);
  if(!product) return;
  const existing = cart.find(c=>c.product.id===productId);
  if(existing){
    existing.qty += Number(qty);
  } else {
    cart.push(new CartItem(product, qty));
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId){
  cart = cart.filter(c=>c.product.id !== productId);
  saveCart();
  renderCart();
}

function updateQty(productId, qty){
  const it = cart.find(c=>c.product.id===productId);
  if(!it) return;
  it.qty = Number(qty);
  if(it.qty <= 0) removeFromCart(productId);
  saveCart();
  renderCart();
}

function clearCart(){
  cart = [];
  saveCart();
  renderCart();
}

document.addEventListener('DOMContentLoaded', async ()=>{

  try{
    const resp = await fetch('data/products.json');
    products = await resp.json();

    products = products.map(p => new Product(p.id,p.name,p.price,p.description));
  }catch(e){
    products = [
      new Product('p1','Camiseta Oficial','2499.00','Camiseta del club - simulador'),
      new Product('p2','Bufanda','799.00','Bufanda tejido oficial'),
      new Product('p3','Entrada General','1500.00','Entrada simulada para partido')
    ];
  }

  loadCart();


  renderProducts();
  renderCart();


  document.getElementById('btn-clear').addEventListener('click', clearCart);
  document.getElementById('btn-checkout').addEventListener('click', ()=>{

    const total = cart.reduce((s,i)=>s + i.subtotal(),0);
    const count = cart.reduce((s,i)=>s + i.qty,0);
    const msg = document.createElement('div');
    msg.className = 'card';
    msg.innerHTML = `<h3>Resumen de la simulación</h3>
      <p>Se simuló una compra con <strong>${count}</strong> items por un total de <strong>$${formatMoney(total)}</strong>.</p>
      <p>Los datos han quedado guardados en localStorage con clave <code>${STORAGE_KEY}</code>.</p>
    `;

    const aside = document.querySelector('.cart');
    aside.insertBefore(msg, aside.firstChild);

  });

  
  document.getElementById('btn-add-custom')?.addEventListener('click', ()=>{
    const name = document.getElementById('custom-name').value.trim();
    const price = Number(document.getElementById('custom-price').value) || 0;
    if(!name || price <= 0) {
      const err = document.createElement('div');
      err.className = 'card';
      err.innerHTML = '<p style="color:var(--muted)">Ingrese nombre y precio válidos.</p>';
      const aside = document.querySelector('.cart');
      aside.insertBefore(err, aside.firstChild);
      setTimeout(()=>err.remove(), 2500);
      return;
    }
    const id = 'p' + (products.length + 1);
    const p = new Product(id,name,price,'Producto agregado por usuario');
    products.push(p);
    renderProducts();
  });
});
