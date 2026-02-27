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
          li.innerHTML = `<strong>${key}:</strong> ${value}`;
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

  // === Модальное окно ===
  function openPurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    const title = document.getElementById('product-title').textContent;
    const price = document.getElementById('product-price').textContent;

    document.getElementById('modal-product-name').textContent = title;
    document.getElementById('modal-product-price').textContent = price;

    modal.style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('purchase-modal').style.display = 'none';
    document.getElementById('key-result').style.display = 'none';
  }

  document.getElementById('confirm-purchase').addEventListener('click', () => {
    const key = Array(4).fill().map(() => Math.random().toString(36).substring(2,6).toUpperCase()).join('-');
    document.getElementById('generated-key').textContent = key;
    document.getElementById('key-result').style.display = 'block';

    document.getElementById('copy-key').onclick = () => {
      navigator.clipboard.writeText(key).then(() => {
        document.getElementById('copy-key').textContent = 'Скопировано!';
        setTimeout(() => {
          document.getElementById('copy-key').textContent = 'Копировать ключ';
        }, 2000);
      });
    };
  });

  // Закрытие модального окна кликом вне
  window.onclick = function(event) {
    const modal = document.getElementById('purchase-modal');
    if (event.target === modal) {
      closeModal();
    }
  };
