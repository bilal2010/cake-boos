// إدارة السلة والطلبات
let cart = JSON.parse(localStorage.getItem('cakeboss_royale_cart')) || [];

function saveCart() {
  localStorage.setItem('cakeboss_royale_cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(title, price) {
  const item = cart.find(i => i.title === title);
  if (item) {
    item.qty++;
  } else {
    cart.push({ title, price, qty: 1 });
  }
  saveCart();
  toggleCart(true);
}

function renderCart() {
  const badge = document.getElementById('cart-badge');
  const list = document.getElementById('cart-items-list');
  const total = document.getElementById('cart-total-price');

  if (badge) badge.innerText = cart.reduce((total, i) => total + i.qty, 0);

  if (list) {
    list.innerHTML = '';
    let sum = 0;
    cart.forEach((i, idx) => {
      sum += i.price * i.qty;
      list.innerHTML += `
        <div class="cart-item-card">
          <div>
            <div style="font-weight:700; color:#FFF; font-size:0.95rem;">${i.title}</div>
            <div style="font-size:0.85rem; color:var(--border-gold-bright);">${i.price} ₪ × ${i.qty}</div>
          </div>
          <button onclick="removeCartItem(${idx})" style="background:none; border:none; color:#FF5C5C; cursor:pointer; font-size:1.2rem; padding:4px 8px;">✕</button>
        </div>
      `;
    });
    if (total) total.innerText = sum + ' ₪';
  }
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function toggleCart(isOpen) {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) drawer.classList.toggle('open', isOpen);
}

function sendOrderWhatsApp(phone = '972598386222') {
  if (cart.length === 0) return alert('السلة فارغة، تفضل باختيار طلباتك الملكية أولاً!');
  let msg = `*طلب فاخر جديد من منيو Cake Boss الملكي 👑*%0A------------------------------------%0A`;
  let sum = 0;
  cart.forEach(i => {
    msg += `• *${i.title}* (${i.qty}x) = ${i.price * i.qty} ₪%0A`;
    sum += i.price * i.qty;
  });
  msg += `------------------------------------%0A*الإجمالي المطلوب:* ${sum} ₪%0A*العنوان ورقم التواصل:* `;
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// نافذة تفاصيل الصنف السريعة (Showcase Modal)
function openShowcase(title, desc, price, img = 'item.png') {
  const modal = document.getElementById('royale-modal');
  if (!modal) return;
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-desc').innerText = desc;
  document.getElementById('modal-price').innerText = price + ' ₪';
  document.getElementById('modal-btn').onclick = () => {
    addToCart(title, price);
    closeShowcase();
  };
  modal.classList.add('active');
}

function closeShowcase() {
  const modal = document.getElementById('royale-modal');
  if (modal) modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', renderCart);