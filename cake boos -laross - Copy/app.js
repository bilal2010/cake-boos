// تحديث التحديد التلقائي للفئة النشطة أثناء التمرير (Active Scroll Spy)
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('.menu-category-section');
  const navLinks = document.querySelectorAll('.cat-pill-link');
  let currentId = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
      link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });
});

// نظام السلة والطلبات
let cart = JSON.parse(localStorage.getItem('cakeboss_loro_cart')) || [];

function saveCart() {
  localStorage.setItem('cakeboss_loro_cart', JSON.stringify(cart));
  renderCartUI();
}

function addToCart(title, price, e) {
  if (e) e.stopPropagation();
  const found = cart.find(i => i.title === title);
  if (found) {
    found.qty++;
  } else {
    cart.push({ title, price, qty: 1 });
  }
  saveCart();
  toggleCart(true);
}

function renderCartUI() {
  const badge = document.getElementById('cart-counter');
  const container = document.getElementById('cart-items-box');
  const sumEl = document.getElementById('cart-total-sum');

  if (badge) badge.innerText = cart.reduce((s, i) => s + i.qty, 0);

  if (container) {
    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      container.innerHTML += `
        <div class="cart-row-item">
          <div>
            <div style="font-weight: 800; font-size: 0.95rem;">${item.title}</div>
            <div style="font-size: 0.85rem; color: var(--loro-text-muted);">${item.price} ₪ × ${item.qty}</div>
          </div>
          <button onclick="removeItem(${index})" style="background:none; border:none; color:#dc2626; font-size:1.1rem; cursor:pointer;">✕</button>
        </div>
      `;
    });
    if (sumEl) sumEl.innerText = total + ' ₪';
  }
}

function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
}

function toggleCart(open) {
  const backdrop = document.getElementById('cart-backdrop');
  const sidebar = document.getElementById('cart-sidebar');
  if (open) {
    backdrop.classList.add('active');
    sidebar.classList.add('open');
  } else {
    backdrop.classList.remove('active');
    sidebar.classList.remove('open');
  }
}

function sendWhatsAppOrder(phone = '972594157070') {
  if (cart.length === 0) return alert('حقيبة الطلبات فارغة!');
  let message = `*طلب قائمة حلويات Cake Boss 🍰*%0A--------------------------------%0A`;
  let total = 0;
  cart.forEach(i => {
    message += `• ${i.title} (${i.qty}x) = ${i.price * i.qty} ₪%0A`;
    total += i.price * i.qty;
  });
  message += `--------------------------------%0A*المجموع المطلوب:* ${total} ₪%0A*الفرع المفضل:* [شارع الوحدة / السرايا]%0A*الاسم والعنوان:* `;
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// نافذة التفاصيل السريعة
function openItemDetail(title, desc, price, img) {
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-desc').innerText = desc;
  document.getElementById('modal-price').innerText = price + ' ₪';
  document.getElementById('modal-add-btn').onclick = (e) => {
    addToCart(title, price, e);
    closeItemDetail();
  };
  document.getElementById('item-modal').classList.add('active');
}

function closeItemDetail() {
  document.getElementById('item-modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', renderCartUI);