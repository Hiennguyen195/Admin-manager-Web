// Nếu chưa đăng nhập thì chuyển về trang login
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

let currentPage = 0;
let pageSize = 5;
let currentSort = "id,asc";

function loadProducts(page = 0) {
  currentPage = page;

  const url = `http://localhost:8080/api/products?page=${page}&size=${pageSize}&sort=${currentSort}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      renderProducts(data.content);
      renderPagination(data.totalPages, data.number);
    })
    .catch(err => {
      document.getElementById('product-list').innerHTML = "<p>Lỗi tải sản phẩm!</p>";
      console.error(err);
    });
}

function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  if (products.length === 0) {
    list.innerHTML = "<p>Không có sản phẩm nào.</p>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>Giá: ${p.price.toLocaleString()} VND</p>
      <p>ID: ${p.id}</p>
    `;
    list.appendChild(div);
  });
}

function renderPagination(totalPages, current) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.disabled = i === current;
    btn.onclick = () => loadProducts(i);
    pagination.appendChild(btn);
  }
}

function changeSort() {
  const select = document.getElementById('sort-select');
  currentSort = select.value;
  loadProducts(0); // reset về trang 0 khi đổi sort
}

window.onload = () => loadProducts();


