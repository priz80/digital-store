  // Получаем ID из URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    document.getElementById('product-title').textContent = 'Товар не найден';
  } else {
    const products = JSON.parse(localStorage.getItem('digitalStoreProducts')) || [];
    const product = products.find(p => p.id == productId);

    if (product) {
      // Заполняем основную информацию
      document.getElementById('product-title').textContent = product.title;
      document.getElementById('product-price').textContent = product.price + ' ₽';
      document.getElementById('product-platform').textContent = product.platform;
      document.getElementById('product-image').src = product.image || 'https://via.placeholder.com/600x300?text=No+Image';
      document.getElementById('product-description').textContent = product.description || 'Описание отсутствует.';

      // Показываем системные требования (если есть)
      if (product.specs) {
        const specsSection = document.getElementById('specs-section');
        specsSection.style.display = 'block';
        const specsList = document.getElementById('specs-list');
        specsList.innerHTML = '';
        Object.entries(product.specs).forEach(([key, value]) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key}:</strong>&nbsp;${value}`;
          specsList.appendChild(li);
        });
      }

      // Загружаем похожие товары
      loadRelatedProducts(product.category, productId);
    } else {
      document.getElementById('product-title').textContent = 'Товар не найден';
    }
  }

  function loadRelatedProducts(category, currentId) {
    const products = JSON.parse(localStorage.getItem('digitalStoreProducts')) || [];
    const related = products
      .filter(p => p.category === category && p.id != currentId)
      .slice(0, 3);

    const container = document.getElementById('related-products');
    related.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.image || 'https://via.placeholder.com/150x100?text=No+Image'}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p>${p.platform}</p>
        <div class="price">${p.price} ₽</div>
        <a href="product.html?id=${p.id}" class="details-button">Подробнее</a>
      `;
      container.appendChild(card);
    });
  }


  // Закрытие модального окна кликом вне
  window.onclick = function(event) {
    const modal = document.getElementById('purchase-modal');
    if (event.target === modal) {
      closeModal();
    }
  };


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
      <a href="product.html?id=${product.id}" target="_blank" class="details-button">
        Подробнее
      </a>
    `;
    container.appendChild(card);
  });

  // ✅ Инициализируем модальное окно ПОСЛЕ добавления кнопок
  if (typeof initPurchaseModal === 'function') {
    initPurchaseModal();
  }
}

// ... весь существующий код ...

// В конце — после объявления всех функций
document.addEventListener("DOMContentLoaded", () => {
  // Загружаем товар, related products и т.д.
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    document.getElementById('product-title').textContent = 'Товар не найден';
  } else {
    const products = JSON.parse(localStorage.getItem('digitalStoreProducts')) || [];
    const product = products.find(p => p.id == productId);

    if (product) {
      document.getElementById('product-title').textContent = product.title;
      document.getElementById('product-price').textContent = product.price + ' ₽';
      document.getElementById('product-platform').textContent = product.platform;
      document.getElementById('product-image').src = product.image || 'https://via.placeholder.com/600x300?text=No+Image';
      document.getElementById('product-description').textContent = product.description || 'Описание отсутствует.';

      if (product.specs) {
        const specsSection = document.getElementById('specs-section');
        specsSection.style.display = 'block';
        const specsList = document.getElementById('specs-list');
        specsList.innerHTML = '';
        Object.entries(product.specs).forEach(([key, value]) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key}:</strong>&nbsp;${value}`;
          specsList.appendChild(li);
        });
      }

      loadRelatedProducts(product.category, productId);
    } else {
      document.getElementById('product-title').textContent = 'Товар не найден';
    }
  }

  // ✅ Инициализируем модальное окно
  if (typeof initPurchaseModal === "function") {
    initPurchaseModal();
  }
});