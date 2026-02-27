// === Загрузка товаров ===
function loadProducts() {
  const saved = localStorage.getItem('digitalStoreProducts');
//   const defaultProducts = [
//     { id: 1, title: "Cyberpunk 2077", price: "1 499", category: "game", platform: "PC | Steam", image: "https://via.placeholder.com/300x140?text=Cyberpunk+2077", isFavorite: true },
//     { id: 2, title: "Adobe Photoshop", price: "6 990", category: "software", platform: "Windows", image: "https://via.placeholder.com/300x140?text=Photoshop", isFavorite: false },
//     { id: 3, title: "Python для начинающих", price: "2 499", category: "course", platform: "Видео курс", image: "https://via.placeholder.com/300x140?text=Python+Курс", isFavorite: true },
//     { id: 4, title: "Spotify Premium", price: "1 999", category: "subscription", platform: "12 месяцев", image: "https://via.placeholder.com/300x140?text=Spotify", isFavorite: false }
//   ];
  return JSON.parse(saved);
}

// === Рендер всех товаров в #productGrid ===
function renderProducts(productsToRender) {
  const container = document.getElementById('productGrid');
  if (!container) return;

  container.innerHTML = '';

  productsToRender.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>${product.platform}</p>
      <div class="price">${product.price} ₽</div>
      <button class="buy-button">Купить</button>
      <a href="product.html?id=${product.id}" target="_blank" class="details-button">Подробнее</a>
    `;
    container.appendChild(card);
  });

  initPurchaseModal();
}

// === Рендер популярных в #favorites ===
function renderFavorites() {
  const container = document.getElementById('favorites');
  if (!container) return;

  const favorites = loadProducts().filter(p => p.isFavorite);
  container.innerHTML = '';

  if (favorites.length === 0) {
    container.innerHTML = '<p>Пока нет популярных товаров.</p>';
    return;
  }

  favorites.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>${product.platform}</p>
      <div class="price">${product.price} ₽</div>
      <button class="buy-button">Купить</button>
      <a href="product.html?id=${product.id}" target="_blank" class="details-button">Подробнее</a>
    `;
    container.appendChild(card);
  });

  initPurchaseModal();
}

// === Фильтрация ===
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  const products = loadProducts();

  const savedCategory = localStorage.getItem('selectedCategory') || 'all';
  let activeCategory = savedCategory;

  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === activeCategory) btn.classList.add('active');
  });

  function applyFilter() {
    let filtered = products;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchInput && searchInput.value.trim()) {
      const term = searchInput.value.toLowerCase().trim();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
    }

    renderProducts(filtered);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      activeCategory = button.dataset.category;
      localStorage.setItem('selectedCategory', activeCategory);
      applyFilter();
    });
  });

  searchInput?.addEventListener('input', applyFilter);

  applyFilter();
  renderFavorites();
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
});

window.addEventListener('storage', () => {
  initFilters();
});