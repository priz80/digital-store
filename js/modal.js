// === Модальное окно покупки ===
function initPurchaseModal() {
  const buyButtons = document.querySelectorAll('.buy-button');
  const modal = document.getElementById('purchase-modal') || createModal();
  if (!modal) return;

  buyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const title = card.querySelector('h3').textContent;
      const price = card.querySelector('.price').textContent;

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

  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.getElementById('confirm-purchase').addEventListener('click', () => {
    const key = Array(4).fill().map(() => Math.random().toString(36).substring(2,6).toUpperCase()).join('-');
    document.getElementById('generated-key').textContent = key;
    document.getElementById('key-result').style.display = 'block';

    document.getElementById('copy-key').onclick = () => {
      navigator.clipboard.writeText(key).then(() => {
        document.getElementById('copy-key').textContent = 'Скопировано!';
      });
    };
  });

  return modal;
}