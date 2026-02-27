// === Бургер-меню и Каталог ===
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  // Бургер
  burger?.addEventListener('click', () => {
    nav.classList.toggle('active');
  });

  // Закрытие при клике вне
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('active');
    }
  });

  // Выпадающее меню на мобильных
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = this.closest('.dropdown');
        dropdown.classList.toggle('active');
      }
    });
  });

  // Закрыть меню при ресайзе
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.classList.remove('active');
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
    }
  });
});