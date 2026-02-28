// === Модальное окно покупки ===
function initPurchaseModal() {
  const buyButtons = document.querySelectorAll('.buy-button');
  const modal = document.getElementById('purchase-modal') || createModal();

  buyButtons.forEach(button => {
    button.addEventListener('click', () => {
      let title, price, productId;

      const card = button.closest('.product-card');
      if (card) {
        // Кнопка на главной или в "похожих"
        title = card.querySelector('h3').textContent;
        price = card.querySelector('.price').textContent;
        const link = card.querySelector('.details-button');
        productId = new URL(link.href).searchParams.get('id');
      } else {
        // Основная кнопка на product.html
        title = document.getElementById('product-title')?.textContent || 'Неизвестно';
        price = document.getElementById('product-price')?.textContent || '0 ₽';
        const urlParams = new URLSearchParams(window.location.search);
        productId = urlParams.get('id');
      }

      // Сохраняем ID товара для использования при подтверждении
      modal.dataset.productId = productId;

      document.getElementById('modal-product-name').textContent = title;
      document.getElementById('modal-product-price').textContent = price;
      modal.style.display = 'flex';
    });
  });
}

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'purchase-modal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5);
    justify-content: center;
    align-items: center;
  `;
  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 500px; position: relative;">
      <span class="modal-close" style="position: absolute; top: 1rem; right: 1rem; font-size: 1.5rem; cursor: pointer;">&times;</span>
      <h2>Подтверждение покупки</h2>
      <p><strong>Товар:</strong> <span id="modal-product-name"></span></p>
      <p><strong>Цена:</strong> <span id="modal-product-price"></span></p>
      <button id="confirm-purchase" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Подтвердить оплату
      </button>
      <div id="key-result" style="margin-top: 1.5rem; display: none;">
        <h3>Оплата прошла!</h3>
        <p><strong>Ключ:</strong></p>
        <div id="generated-key" style="font-family: monospace; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
          XXXX-XXXX-XXXX-XXXX
        </div>
        <button id="copy-key" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #1e3a8a; color: white; border: none; border-radius: 6px;">
          Копировать
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Закрытие по крестику
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Закрытие по клику вне
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Генерация ключа или ссылки
document.getElementById('confirm-purchase').addEventListener('click', () => {
  const productId = modal.dataset.productId;
  const products = JSON.parse(localStorage.getItem('digitalStoreProducts')) || [];
  const product = products.find(p => p.id == productId);

  const resultDiv = document.getElementById('key-result');
  
  if (!product) {
    resultDiv.innerHTML = `<p>Ошибка: товар не найден.</p>`;
    resultDiv.style.display = 'block';
    return;
  }

  if (product.downloadUrl) {
    // Показываем ссылку для скачивания
    resultDiv.innerHTML = `
      <h3>Оплата прошла успешно!</h3>
      <p>📥 Ваш файл готов к загрузке:</p>
      <a href="${product.downloadUrl}" class="download-link" target="_blank" style="
        display: inline-block;
        margin: 1rem 0;
        padding: 0.75rem 1.5rem;
        background: #1e3a8a;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      ">Скачать файл</a>
      <p style="color: #059669; margin-top: 1rem;">
        ✅ Файл доступен без ограничений
      </p>
    `;
  } else {
    // Генерируем ключ
    const key = Array(4)
      .fill()
      .map(() => Math.random().toString(36).substring(2, 6).toUpperCase())
      .join('-');

    resultDiv.innerHTML = `
      <h3>Оплата прошла успешно!</h3>
      <p><strong>Ваш ключ:</strong></p>
      <div id="generated-key" style="
        font-family: monospace;
        padding: 1rem;
        background: #f3f4f6;
        border-radius: 8px;
        word-spacing: 0.25em;
      ">${key}</div>
      <button id="copy-key" style="
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #1e3a8a;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      ">Копировать ключ</button>
    `;

    // Копирование
    resultDiv.querySelector('#copy-key').onclick = () => {
      navigator.clipboard.writeText(key).then(() => {
        resultDiv.querySelector('#copy-key').textContent = 'Скопировано!';
        setTimeout(() => {
          resultDiv.querySelector('#copy-key').textContent = 'Копировать ключ';
        }, 2000);
      });
    };
  }

  resultDiv.style.display = 'block';
});

  return modal;
}