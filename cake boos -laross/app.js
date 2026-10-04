// مؤشر الماوس التفاعلي
const cursor = document.getElementById('customCursor');

document.addEventListener('mousemove', (e) => {
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
});

function initHoverEffects() {
  const interactiveElements = document.querySelectorAll('button, a, .booklet-item-row, .slider-side-arrow, .quick-cat-btn');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursor) {
        cursor.classList.add('active-hover');
        cursor.innerText = 'طلب ✨';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (cursor) {
        cursor.classList.remove('active-hover');
        cursor.innerText = '';
      }
    });
  });
}

// محرك السحب بالماوس واللمس (Drag & Touch Swipe Engine)
const track = document.getElementById('peekingSliderTrack');
let isDown = false;
let startX;
let scrollLeftVal;
let isDragging = false;

if (track) {
  // أحداث الماوس
  track.addEventListener('mousedown', (e) => {
    isDown = true;
    isDragging = false;
    track.classList.add('dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeftVal = track.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('dragging');
    setTimeout(() => { isDragging = false; }, 50);
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5; // سرعة السحب
    if (Math.abs(walk) > 5) isDragging = true;
    track.scrollLeft = scrollLeftVal - walk;
  });

  // مزامنة التاب النشط في الشريط العلوي أثناء التمرير
  track.addEventListener('scroll', () => {
    const cards = track.querySelectorAll('.booklet-page-card');
    const trackCenter = track.getBoundingClientRect().left + track.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const distance = Math.abs(trackCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    const targetCat = cards[closestIndex].getAttribute('data-cat-id');
    document.querySelectorAll('.quick-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === targetCat);
    });
  });
}

// أزرار الأسهم الكبيرة
function scrollSlide(direction) {
  if (!track) return;
  const card = track.querySelector('.booklet-page-card');
  const cardWidth = card.offsetWidth + 32;
  track.scrollBy({
    left: direction * -cardWidth,
    behavior: 'smooth'
  });
}

// القفز المباشر عند الضغط على تصنيف من الشريط العلوي
function scrollToCategory(catId) {
  const targetCard = document.querySelector(`.booklet-page-card[data-cat-id="${catId}"]`);
  if (targetCard && track) {
    track.scrollTo({
      left: targetCard.offsetLeft - (track.offsetWidth - targetCard.offsetWidth) / 2,
      behavior: 'smooth'
    });
  }
}

// تبديل الشاشات الأساسية
function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach(scr => {
    scr.classList.remove('screen-active');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('screen-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-links-center button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-screen') === screenId) {
      btn.classList.add('active');
    }
  });
}

// السلة والواتساب
let cart = JSON.parse(localStorage.getItem('cb_sweet_bag')) || [];

function saveCart() {
  localStorage.setItem('cb_sweet_bag', JSON.stringify(cart));
  renderCart();
}

function addToCart(title, price, e) {
  if (e) e.stopPropagation();
  if (isDragging) return; // منع الإضافة بالخطأ أثناء السحب
  const exist = cart.find(i => i.title === title);
  if (exist) {
    exist.qty++;
  } else {
    cart.push({ title, price, qty: 1 });
  }
  saveCart();
  toggleBag(true);
}

function renderCart() {
  const badge = document.getElementById('bag-count-badge');
  const list = document.getElementById('bag-items-box');
  const sumEl = document.getElementById('bag-total-sum');

  if (badge) badge.innerText = cart.reduce((s, i) => s + i.qty, 0);

  if (list) {
    list.innerHTML = '';
    let total = 0;
    cart.forEach((i, idx) => {
      total += i.price * i.qty;
      list.innerHTML += `
        <div class="bag-item-card">
          <div>
            <div style="font-weight: 800; color: var(--pistachio-deep);">${i.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-soft);">${i.price} ₪ × ${i.qty}</div>
          </div>
          <button onclick="removeBagItem(${idx})" style="background:none; border:none; color:#dc2626; font-size:1.2rem; cursor:pointer;">✕</button>
        </div>
      `;
    });
    if (sumEl) sumEl.innerText = total + ' ₪';
  }
}

function removeBagItem(idx) {
  cart.splice(idx, 1);
  saveCart();
}

function toggleBag(show) {
  const overlay = document.getElementById('bag-overlay');
  const drawer = document.getElementById('bag-drawer');
  if (show) {
    overlay.classList.add('active');
    drawer.classList.add('open');
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('open');
  }
}

function sendWhatsAppOrder(phone = '972594157070') {
  if (cart.length === 0) return alert('السلة فارغة، اختر بعض الحلويات أولاً!');
  let msg = `*طلب حلى فاخر من منيو كيك بوس 🍰*%0A--------------------------------%0A`;
  let total = 0;
  cart.forEach(i => {
    msg += `• *${i.title}* (${i.qty}x) = ${i.price * i.qty} ₪%0A`;
    total += i.price * i.qty;
  });
  msg += `--------------------------------%0A*الإجمالي المطلوب:* ${total} ₪%0A*العنوان ورقم التواصل:* `;
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// نافذة المودال
function openDessertModal(title, desc, price, img) {
  if (isDragging) return; // منع فتح المودال عند السحب
  document.getElementById('modalImg').src = img;
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalDesc').innerText = desc;
  document.getElementById('modalPrice').innerText = price + ' ₪';
  document.getElementById('modalAddBtn').onclick = (e) => {
    addToCart(title, price, e);
    closeDessertModal();
  };
  document.getElementById('dessertModal').classList.add('active');
}

function closeDessertModal() {
  document.getElementById('dessertModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initHoverEffects();
});