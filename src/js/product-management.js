document.addEventListener("DOMContentLoaded", function () {
  const pageSizeSelect = document.getElementById("product-page-size");
  const categoryFilter = document.getElementById("filter-category");
  const productLink = document.querySelector('a[href="#products"]');
  const paginationContainer = document.getElementById("product-pagination");
  const tbody = document.getElementById("product-table-body");

  const addProductBtn = document.getElementById("add-product-btn");
  const productModal = document.getElementById("add-product-modal");
  const closeBtn = document.querySelector(".close-btn");
  const addProductForm = document.getElementById("add-product-form");

  const editModal = document.getElementById("edit-product-modal");
  const editForm = document.getElementById("edit-product-form");
  const closeEditBtn = document.querySelector(".close-edit-btn");

  let currentPage = 0;
  let currentSize = parseInt(pageSizeSelect.value);
  let currentCategory = "";
  let currentKeyword = "";
  let searchTimeout = null;

  // Xử lý tìm kiếm sản phẩm (làm sau)
  // const searchInput = document.getElementById("search-product-input");
  // searchInput.addEventListener("input", () => {
  //   currentKeyword = searchInput.value.trim();
  //   clearTimeout(searchTimeout);
  //   searchTimeout = setTimeout(() => {
  //     fetchProducts(0, currentSize, currentCategory, currentKeyword);
  //   }, 300);
  // });

  function fetchProducts(page = 0, size = 10, category = "", keyword = "") {
    const token = localStorage.getItem("token");
    let url = "";

    if (keyword) {
      url = `http://localhost:8080/api/users/search?username=${keyword}&email=${keyword}&page=${page}&size=${size}`;
      if (category) {
        url += `&category=${category}`;
      }
    } else if (category) {
      url = `http://localhost:8080/api/products/category?categoryId=${category}&page=${page}&size=${size}`;
    } else {
      url = `http://localhost:8080/api/products?page=${page}&size=${size}`;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi tải danh sách sản phẩm");
        return res.json();
      })
      .then((data) => {
        renderProducts(data.content);
        renderProductPagination(data.page.totalPages, data.page.number);
      })
      .catch((err) => alert("Lỗi: " + err.message));
  }

  function renderProducts(products) {
    tbody.innerHTML = "";

    products.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td class="table-shadow-hover">${p.id}</td>
              <td class="table-shadow-hover">${p.productName}</td>
              <td class="table-shadow-hover">${p.categoryName}</td>
              <td class="table-shadow-hover">${p.price.toLocaleString()}</td>
              <td class="table-shadow-hover">${p.stock}</td>
              <td>
                <button 
                  class="edit-btn" 
                  data-id="${p.id}" 
                  data-price="${p.price}" 
                  data-stock="${p.stock}"
                >
                <i class="fa-solid fa-pen-to-square"></i> Cập nhập
                </button>
                <button class="delete-btn" data-id="${
                  p.id
                }"><i class="fa-solid fa-trash-can"></i> Xóa</button>
              </td>
            `;
      tbody.appendChild(row);
    });

    // Function update product, delete product
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editModal.classList.remove("hidden");
        form.elements["id"].value = btn.dataset.id;
        form.elements["price"].value = btn.dataset.price;
        form.elements["stock"].value = btn.dataset.stock;
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
          const token = localStorage.getItem("token");
          console.log(btn.dataset.id);
          fetch(`http://localhost:8080/api/products/${btn.dataset.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => {
              if (!res.ok) throw new Error("Xóa sản phẩm thất bại!");
              return res.text(); // hoặc .json() nếu backend trả về JSON
            })
            .then(() => {
              alert("Xóa sản phẩm thành công!");
              fetchUsers(currentPage, currentSize); // load lại trang hiện tại
            })
            .catch((err) => {
              alert("Lỗi: " + err.message);
            });
        }
      });
    });
  }

  function renderProductPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    const prev = document.createElement("button");
    prev.textContent = "Trang trước";
    prev.disabled = currentPage === 0;
    prev.addEventListener("click", () =>
      fetchProducts(
        currentPage - 1,
        currentSize,
        currentCategory,
        currentKeyword
      )
    );
    paginationContainer.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if (i === currentPage) {
        btn.style.backgroundColor = "#F16767";
        btn.style.color = "#fff";
      }
      btn.addEventListener("click", () =>
        fetchProducts(i, currentSize, currentCategory, currentKeyword)
      ); // thêm category & keyword
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Trang sau";
    next.disabled = currentPage === totalPages - 1;
    next.addEventListener("click", () =>
      fetchProducts(
        currentPage + 1,
        currentSize,
        currentCategory,
        currentKeyword
      )
    );
    paginationContainer.appendChild(next);
  }

  // Modal thêm product
  addProductBtn.addEventListener("click", () => {
    productModal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    productModal.classList.add("hidden");
  });

  addProductForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(addProductForm);

    const newProduct = {
      productName: formData.get("productName"),
      description: formData.get("description"),
      price: parseFloat(formData.get("price")),
      stock: parseInt(formData.get("stock")),
      categoryId: parseInt(formData.get("categoryId")),
    };

    fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể thêm sản phẩm!");
        // return res.json();
      })
      .then(() => {
        alert("Thêm sản phẩm thành công!");
        productModal.classList.add("hidden");
        addProductForm.reset();
        fetchProducts(currentPage, currentSize, currentCategory);
      })
      .catch((err) => alert("Lỗi: " + err.message));
  });

  // Modal cập nhật
  closeEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
  });

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const updatedProduct = {
      price: parseFloat(editForm.elements["price"].value),
      stock: parseInt(editForm.elements["stock"].value),
    };

    const productId = editForm.elements["id"].value;

    fetch(`http://localhost:8080/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProduct),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Cập nhật thông tin thất bại!");
      })
      .then(() => {
        alert("Cập nhật thông tin thành công!");
        editModal.classList.add("hidden");
        fetchProducts(currentPage, currentSize, currentCategory);
      })
      .catch((err) => alert("Lỗi: " + err.message));
  });

  // Filter category
  categoryFilter.addEventListener("change", () => {
    currentCategory = categoryFilter.value; // ← cập nhật biến toàn cục
    fetchProducts(0, currentSize, currentCategory, currentKeyword);
  });

  // Khi thay đổi số sản phẩm/trang
  pageSizeSelect.addEventListener("change", () => {
    currentSize = parseInt(pageSizeSelect.value);
    fetchProducts(0, currentSize, currentCategory, currentKeyword);
  });

  // Khi nhấn vào tab products
  productLink.addEventListener("click", () => {
    currentPage = 0;
    currentSize = parseInt(pageSizeSelect.value);
    fetchProducts(currentPage, currentSize, currentCategory, currentKeyword); // thêm currentCategory & currentKeyword
  });
});
