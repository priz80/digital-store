// === Константы ===
const SPEC_FIELDS = {
  spec_os: "ОС",
  spec_cpu: "Процессор",
  spec_ram: "Оперативная память",
  spec_gpu: "Видеокарта",
  spec_storage: "Место на диске",
};

let products = [];

// === DOM Elements ===
function $(id) {
  return document.getElementById(id);
}

// === Инициализация ===
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("adminLoggedIn")) {
    showAdminPanel();
  }
});

function showAdminPanel() {
  const adminSection = $("adminSection");
  const loginSection = $("loginSection");

  if (adminSection) adminSection.style.display = "block";
  if (loginSection) loginSection.style.display = "none";

  loadProducts(); // Загружаем товары
  initForm(); // ✅ Подключаем обработчик формы!
}

// === Авторизация (второй уровень) ===
async function login() {
  const login = $("adminLogin")?.value.trim();
  const password = $("adminPassword")?.value;

  if (login !== "admin") {
    alert("Неверный логин");
    return;
  }

  const CORRECT_HASH =
    "cebc35dde4d786bf16d4f581c5ba7e4f902be9be59c5b310dcc4a6dc94602eaf";

  try {
    const hashed = await hashPassword(password);
    if (hashed === CORRECT_HASH) {
      localStorage.setItem("adminLoggedIn", "true");
      showAdminPanel();
    } else {
      alert("Неверный пароль");
    }
  } catch (err) {
    alert("Ошибка при авторизации");
    console.error(err);
  }
}

// Вспомогательная функция хэширования
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function logout() {
  // Удаляем флаг входа
  localStorage.removeItem("adminLoggedIn");

  // Скрываем админку
  const adminSection = document.getElementById("adminSection");
  const loginSection = document.getElementById("loginSection");

  if (adminSection) adminSection.style.display = "none";
  if (loginSection) loginSection.style.display = "block";

  // Очищаем форму
  resetForm();
}

// === Работа с товарами ===
function loadProducts() {
  products = JSON.parse(localStorage.getItem("digitalStoreProducts")) || [];
  renderProducts();
}

function renderProducts() {
  const tbody = $("productTable")?.querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  products.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.image || "https://via.placeholder.com/50"}" width="50" style="border-radius:8px"></td>
      <td>${p.title}</td>
      <td>${p.price} ₽</td>
      <td>${getCategory(p.category)}</td>
      
      <td class="actions">
        <button class="edit" data-id="${i}">Ред.</button>
        <button class="delete" data-id="${i}">Удалить</button>
      </td>

      <td><input type="checkbox" data-id="${i}" ${p.isFavorite ? "checked" : ""}></td>
      <td>${p.downloadUrl ? "Ссылка" : "Ключ активации"}</td>
    `;
    tbody.appendChild(tr);
  });

  attachButtons();
  attachFavoriteCheckboxes(); // Подключаем чекбоксы
}

function attachFavoriteCheckboxes() {
  document
    .querySelectorAll('input[type="checkbox"][data-id]')
    .forEach((checkbox) => {
      checkbox.onchange = function () {
        const id = this.dataset.id;
        products[id].isFavorite = this.checked;
        saveAndSync();
      };
    });
}

function getCategory(value) {
  const map = {
    game: "Игры",
    software: "Программы",
    course: "Курсы",
    subscription: "Подписки",
  };
  return map[value] || value;
}

// === Форма добавления/редактирования ===
function initForm() {
  const form = $("productForm");
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const price = parseFloat(form.price.value);

    if (!title) return alert("Введите название товара");
    if (isNaN(price) || price < 0) {
      return alert("Цена должна быть числом ≥ 0");
    }
    if (price > 1000000) return alert("Цена слишком высокая");

    const specs = {};
    Object.keys(SPEC_FIELDS).forEach((key) => {
      const el = $(key);
      if (el) {
        const value = el.value.trim();
        if (value) {
          specs[SPEC_FIELDS[key]] = value;
        }
      }
    });

    const product = {
      id: Date.now(),
      title,
      price,
      category: form.category.value,
      platform: form.platform.value,
      image: form.image.value,
      description: form.description.value,
      downloadUrl: form.downloadUrl.value.trim() || undefined,
    };

    if (Object.keys(specs).length > 0) {
      product.specs = specs;
    }

    const editId = form.dataset.editId;
    if (editId !== undefined) {
      products[editId] = product;
    } else {
      products.push(product);
    }

    saveAndSync();
    resetForm();
  };
}

// === Загрузка изображения ===
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Файл слишком большой. Максимум — 2 МБ.");
    this.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const dataUrl = event.target.result;
    $("image").value = dataUrl;
    const preview = $("imagePreview");
    preview.src = dataUrl;
    preview.style.display = "block";
    $("removeImgBtn").style.display = "block";
  };
  reader.readAsDataURL(file);
});

// === UI и вспомогательные функции ===
function toggleSpecs() {
  const fields = $("specsFields");
  const btn = document.querySelector(".toggle-specs-btn");
  if (!fields || !btn) return;

  const isHidden = fields.style.display === "none";
  fields.style.display = isHidden ? "block" : "none";
  btn.textContent = isHidden
    ? "❌ Скрыть системные требования"
    : "⚙️ Показать системные требования";
}

function resetForm() {
  const form = $("productForm");
  if (!form) return;

  form.reset();
  clearSpecInputs();

  $("image").value = "";
  const preview = $("imagePreview");
  preview.src = "";
  preview.style.display = "none";

  delete form.dataset.editId;
  $("submitBtn").textContent = "Добавить товар";
  $("editModeIndicator").style.display = "none";

  if ($("specsFields")?.style.display === "block") {
    toggleSpecs();
  }

  $("removeImgBtn").style.display = "none";
}

function clearSpecInputs() {
  Object.keys(SPEC_FIELDS).forEach((key) => {
    const el = $(key);
    if (el) el.value = "";
  });
}

function attachButtons() {
  document.querySelectorAll(".edit").forEach((btn) => {
    btn.onclick = () => editProduct(btn.dataset.id);
  });

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.onclick = () => deleteProduct(btn.dataset.id);
  });
}

function editProduct(id) {
  const p = products[id];
  if (!p) return;

  $("editModeIndicator").style.display = "block";

  $("title").value = p.title || "";
  $("price").value = p.price || "";
  $("category").value = p.category || "";
  $("platform").value = p.platform || "";
  $("description").value = p.description || "";

  if (p.image) {
    $("image").value = p.image;
    const preview = $("imagePreview");
    preview.src = p.image;
    preview.style.display = "block";
    $("removeImgBtn").style.display = "block";
  }

  const specs = p.specs || {};
  $("spec_os").value = specs["ОС"] || "";
  $("spec_cpu").value = specs["Процессор"] || "";
  $("spec_ram").value = specs["Оперативная память"] || "";
  $("spec_gpu").value = specs["Видеокарта"] || "";
  $("spec_storage").value = specs["Место на диске"] || "";

  const form = $("productForm");
  form.dataset.editId = id;
  $("submitBtn").textContent = "Сохранить изменения";

  if ($("specsFields").style.display === "none") {
    toggleSpecs();
  }
}

function deleteProduct(id) {
  if (confirm("Удалить товар?")) {
    products.splice(id, 1);
    saveAndSync();
  }
}

function saveAndSync() {
  localStorage.setItem("digitalStoreProducts", JSON.stringify(products));
  window.dispatchEvent(new Event("storage"));
  renderProducts();
}

// === Шаблоны ===
function applyGameTemplate() {
  $("category").value = "game";
  $("platform").value = "PC | Steam";
  $("description").value =
    "Эпическая игра с открытым миром и захватывающим сюжетом.";
  $("spec_os").value = "Windows 10/11 64-bit";
  $("spec_cpu").value = "Intel i5 или аналогичный AMD";
  $("spec_ram").value = "8 ГБ";
  $("spec_gpu").value = "NVIDIA GTX 1050 / AMD Radeon RX 570";
  $("spec_storage").value = "50 ГБ";
  if ($("specsFields").style.display === "none") toggleSpecs();
}

function applySoftwareTemplate() {
  $("category").value = "software";
  $("platform").value = "Windows | macOS";
  $("description").value =
    "Мощное программное обеспечение для работы и творчества.";
  $("spec_os").value = "Windows 10+, macOS 12+";
  $("spec_cpu").value = "Intel Core i3 или аналог";
  $("spec_ram").value = "4 ГБ";
  $("spec_gpu").value = "Интегрированная";
  $("spec_storage").value = "5 ГБ";
  if ($("specsFields").style.display === "none") toggleSpecs();
}

function applyCourseTemplate() {
  $("category").value = "course";
  $("platform").value = "Онлайн";
  $("description").value =
    "Обучение с нуля до профи. Видеоуроки, домашние задания, сертификат.";
  $("spec_os").value = "Любая ОС с браузером";
  $("spec_cpu").value = "Любой";
  $("spec_ram").value = "2 ГБ";
  $("spec_gpu").value = "Не требуется";
  $("spec_storage").value = "Доступ в интернет";
  if ($("specsFields").style.display === "none") toggleSpecs();
}

function applySubscriptionTemplate() {
  $("category").value = "subscription";
  $("platform").value = "PC, PS, Xbox, Mobile";
  $("description").value =
    "Месячная подписка на сервис с доступом ко всему контенту.";
  $("spec_os").value = "Зависит от платформы";
  $("spec_cpu").value = "Не требуется";
  $("spec_ram").value = "Не требуется";
  $("spec_gpu").value = "Не требуется";
  $("spec_storage").value = "Интернет-подключение";
  if ($("specsFields").style.display === "none") toggleSpecs();
}

function removeImage() {
  $("image").value = "";
  const preview = $("imagePreview");
  const btn = $("removeImgBtn");
  preview.src = "";
  preview.style.display = "none";
  btn.style.display = "none";
}

// === Drag & Drop ===
const dropArea = $("dropArea");
const fileInput = $("imageUpload");

dropArea.addEventListener("click", () => fileInput.click());

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

dropArea.addEventListener("dragenter", () =>
  dropArea.classList.add("highlight"),
);
dropArea.addEventListener("dragover", () =>
  dropArea.classList.add("highlight"),
);
dropArea.addEventListener("dragleave", () =>
  dropArea.classList.remove("highlight"),
);

dropArea.addEventListener("drop", (e) => {
  dropArea.classList.remove("highlight");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    const event = new Event("change");
    fileInput.dispatchEvent(event);
  }
});

// === Экспорт/Импорт ===
function exportProducts() {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(products, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "digitalstore-products.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function importProducts() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          products = imported;
          saveAndSync();
          alert("Товары успешно импортированы!");
        } else {
          alert("Некорректный формат файла.");
        }
      } catch (err) {
        alert("Ошибка при чтении файла.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
