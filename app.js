
const products = [
  {
    id: 'p1',
    name: 'Mezcladora Monomando',
    desc: 'Cartucho cerámico, ahorro de agua. Ideal para lavabo y cocina.',
    price: 1299.00,
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'p2',
    name: 'Regadera de lluvia',
    desc: 'Diámetro amplio, sistema anti-cal y flujo uniforme.',
    price: 2399.00,
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 'p3',
    name: 'Válvulas y accesorios',
    desc: 'Conexiones y válvulas de alta resistencia para instalaciones.',
    price: 499.00,
    img: 'https://images.unsplash.com/photo-1581578015186-4a5b1f3b4a1a?auto=format&fit=crop&w=800&q=60'
  }
];

let cart = [];


const productsEl = document.querySelector('.products');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkout');


function init() {
  renderProducts();
  loadCartFromStorage();
  updateCartUI();
  attachEvents();
}
function renderProducts(){
  productsEl.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('article');
    el.className = 'product card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">$${p.price.toFixed(2)}</div>
      <div class="actions">
        <button class="btn add" data-id="${p.id}">Agregar al carrito</button>
        <button class="btn secondary details" data-id="${p.id}">Ver detalle</button>
      </div>
    `;
    productsEl.appendChild(el);
  });
}
function attachEvents(){
  productsEl.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('add')) addToCart(id);
    if(btn.classList.contains('details')) alertDetail(id);
  });
  cartBtn.addEventListener('click', () => openCart());
  closeCart.addEventListener('click', () => closeCartModal());
  clearCartBtn.addEventListener('click', () => { cart = []; saveCart(); updateCartUI(); });
  checkoutBtn.addEventListener('click', () => checkout());
  cartModal.addEventListener('click', (e) => { if(e.target === cartModal) closeCartModal(); });
}
function alertDetail(id){
  const p = products.find(x => x.id === id);
  if(p) alert(`${p.name}\n\n${p.desc}\n\nPrecio: $${p.price.toFixed(2)}`);
}
function addToCart(id){
  const p = products.find(x => x.id === id);
  if(!p) return;
  const item = cart.find(i => i.id === id);
  if(item) item.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  saveCart();
  updateCartUI();

  flashMessage('Producto agregado al carrito');
}
function saveCart(){ localStorage.setItem('helvex_cart', JSON.stringify(cart)); }
function loadCartFromStorage(){
  const data = localStorage.getItem('helvex_cart');
  if(data) cart = JSON.parse(data);
}
function updateCartUI(){
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  cartCount.textContent = totalQty;
  renderCartItems();
}
function renderCartItems(){
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p>El carrito está vacío.</p>';
    cartTotalEl.textContent = '$0.00';
    return;
  }
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="muted">Cantidad: <span>${item.qty}</span></div>
      </div>
      <div style="text-align:right">
        <div>$${(item.price * item.qty).toFixed(2)}</div>
        <div style="margin-top:6px">
          <button class="btn small" data-action="minus" data-id="${item.id}">-</button>
          <button class="btn small" data-action="plus" data-id="${item.id}">+</button>
          <button class="btn secondary small" data-action="remove" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = '$' + total.toFixed(2);


  cartItemsEl.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = b.dataset.id;
      const action = b.dataset.action;
      modifyCartItem(id, action);
    });
  });
}
function modifyCartItem(id, action){
  const idx = cart.findIndex(i => i.id === id);
  if(idx === -1) return;
  if(action === 'plus') cart[idx].qty++;
  if(action === 'minus') {
    cart[idx].qty--;
    if(cart[idx].qty <= 0) cart.splice(idx,1);
  }
  if(action === 'remove') cart.splice(idx,1);
  saveCart();
  updateCartUI();
}
function openCart(){ cartModal.classList.remove('hidden'); cartModal.setAttribute('aria-hidden','false'); renderCartItems(); }
function closeCartModal(){ cartModal.classList.add('hidden'); cartModal.setAttribute('aria-hidden','true'); }
function checkout(){
  if(cart.length === 0){ alert('El carrito está vacío.'); return; }

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const confirmMsg = `Total a pagar: $${total.toFixed(2)}\n\nSimulación de compra: ¿Deseas finalizar?`;
  if(confirm(confirmMsg)){
 
    cart = [];
    saveCart();
    updateCartUI();
    closeCartModal();
    alert('Compra simulada realizada con éxito. (No se procesó ningún pago real.)');
  }
}
function flashMessage(text){
  const el = document.createElement('div');
  el.textContent = text;
  el.style = 'position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:10px 14px;border-radius:8px;z-index:9999;opacity:0;transition:all .25s';
  document.body.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity = 1; });
  setTimeout(()=>{ el.style.opacity = 0; setTimeout(()=>el.remove(),300); },1400);
}

init();
