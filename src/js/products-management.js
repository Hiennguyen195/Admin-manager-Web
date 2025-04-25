document.addEventListener("DOMContentLoaded", function () {
  const productLink = document.querySelector('a[href="#products"]');
  const paginationContainer = document.getElementById("product-pagination");
  const pageSizeSelect = document.getElementById("product-page-size");

  const modal = document.getElementById("add-product-modal");
  const addBtn = document.getElementById("add-product-btn");
  const closeBtn = document.querySelector(".close-btn");
  const form = document.getElementById("add-product-form");
  
  const editModal = document.getElementById("edit-product-modal");
  const editForm = document.getElementById("edit-product-form");
  const closeEditBtn = document.querySelector(".close-edit-btn");

  let currentPage = 0;
  let currentSize = parseInt(pageSizeSelect.value);

  function fetchProducts(page = 0, size = 10) {
    const token = localStorage.getItem("token");
    currentPage = page;
    currentSize = size;

    fetch(`http://localhost:8080/api/products?page=${page}&size=${size}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error(
              "Token hết hạn hoặc không hợp lệ, vui lòng đăng nhập lại."
            );
          } else {
            throw new Error("Lỗi khi tải sản phẩm!");
          }
        }
        return res.json();
      })
      .then((data) => {
        const products = data.content;
        const tbody = document.getElementById("product-table-body");
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

        // Xóa sản phẩm
        document.querySelectorAll(".delete-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const productId = btn.getAttribute("data-id");
            const confirmDelete = confirm(
              "Bạn có chắc chắn muốn xóa sản phẩm này?"
            );
            if (!confirmDelete) return;

            const token = localStorage.getItem("token");

            fetch(`http://localhost:8080/api/products/${productId}`, {
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
                fetchProducts(currentPage, currentSize); // load lại trang hiện tại
              })
              .catch((err) => {
                alert("Lỗi: " + err.message);
              });
          });
        });

        document.querySelectorAll(".edit-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const modal = document.getElementById("edit-product-modal");
            const form = document.getElementById("edit-product-form");

            // Gán dữ liệu vào form
            form.elements["id"].value = btn.dataset.id;
            form.elements["price"].value = btn.dataset.price;
            form.elements["stock"].value = btn.dataset.stock;

            modal.classList.remove("hidden");
          });
        });

        createPagination(data.page.totalPages, data.page.number);
      }); 
  }

  function createPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    const prev = document.createElement("button");
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    // prev.textContent = "Trang trước";
    prev.disabled = currentPage === 0;
    prev.addEventListener("click", () =>
      fetchProducts(currentPage - 1, currentSize)
    );
    paginationContainer.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if (i === currentPage) {
        btn.style.backgroundColor = "#F16767";
        btn.style.color = "#fff";
      }
      btn.addEventListener("click", () => fetchProducts(i, currentSize));
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    // next.textContent = "Trang sau";
    next.disabled = currentPage === totalPages - 1;
    next.addEventListener("click", () =>
      fetchProducts(currentPage + 1, currentSize)
    );
    paginationContainer.appendChild(next);
  }

  // Khi nhấn vào tab products
  productLink.addEventListener("click", () => {
    currentPage = 0;
    currentSize = parseInt(pageSizeSelect.value);
    fetchProducts(currentPage, currentSize);
  });

  // Khi thay đổi số sản phẩm/trang
  pageSizeSelect.addEventListener("change", () => {
    currentSize = parseInt(pageSizeSelect.value);
    fetchProducts(0, currentSize);
  });

  // Mở modal khi nhấn nút
  addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Đóng modal khi nhấn nút x
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Submit form
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const formData = new FormData(form);

    const product = {
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
      body: JSON.stringify(product),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể thêm sản phẩm!");

        // return res.json(); //Xử lý sau
      })
      .then((data) => {
        alert("Thêm sản phẩm thành công!");
        modal.classList.add("hidden");
        form.reset();
        // Gọi lại fetchProducts để reload danh sách
        fetchProducts(0, currentSize);
      })
      .catch((err) => {
        alert("Lỗi: " + err.message);
      });
      
  });

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
        if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại!");
        // return res.json();
      })
      .then(() => {
        alert("Cập nhật sản phẩm thành công!");
        editModal.classList.add("hidden");
        fetchProducts(currentPage, currentSize);
      })
      .catch((err) => {
        alert("Lỗi: " + err.message);
      });
  });
});
