document.addEventListener("DOMContentLoaded", function () {
  const userLink = document.querySelector('a[href="#users"]');
  const paginationContainer = document.getElementById("user-pagination");
  const pageSizeSelect = document.getElementById("user-page-size");
  const tbody = document.getElementById("user-table-body");

  let currentPage = 0;
  let currentSize = parseInt(pageSizeSelect.value);

  function fetchUsers(page = 0, size = 10) {
    const token = localStorage.getItem("token");
    currentPage = page;
    currentSize = size;

    fetch(`http://localhost:8080/api/users?page=${page}&size=${size}`, {
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
            throw new Error("Lỗi khi tải danh sách người dùng!");
          }
        }
        return res.json();
      })
      .then((data) => {
        const users = data.content;
        tbody.innerHTML = "";

        users.forEach((u) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="table-shadow-hover">${u.id}</td>
            <td class="table-shadow-hover">${u.userName}</td>
            <td class="table-shadow-hover">${u.email}</td>
            <td class="table-shadow-hover">${u.firstName} ${u.lastName}</td>
            <td class="table-shadow-hover">${u.birthDate}</td>
            <td class="table-shadow-hover">${u.cartId}</td>
            <td class="table-shadow-hover">${u.role}</td>
            <td>
              <button class="edit-btn"><i class="fa-solid fa-plus-minus"></i> Sửa</button>
              <button class="delete-btn" data-id="${u.id}"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </td>
          `;
          tbody.appendChild(row);
        });

        // Xóa người dùng
        document.querySelectorAll(".delete-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = btn.getAttribute("data-id");
            const confirmDelete = confirm(
              "Bạn có chắc chắn muốn xóa người dùng này?"
            );
            if (!confirmDelete) return;

            const token = localStorage.getItem("token");

            fetch(`http://localhost:8080/api/users/${userId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => {
                if (!res.ok) throw new Error("Xóa người dùng thất bại!");
                return res.text(); // hoặc .json() nếu backend trả về JSON
              })
              .then(() => {
                alert("Xóa người dùng thành công!");
                fetchUsers(currentPage, currentSize); // load lại trang hiện tại
              })
              .catch((err) => {
                alert("Lỗi: " + err.message);
              });
          });
        });

        createPagination(data.page.totalPages, data.page.number);
      })
      .catch((err) => {
        console.error("Lỗi tải user:", err.message);
        alert("Đã có lỗi xảy ra khi tải danh sách người dùng.");
      });
  }

  function createPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    const prev = document.createElement("button");
    prev.textContent = "Trang trước";
    prev.disabled = currentPage === 0;
    prev.addEventListener("click", () =>
      fetchUsers(currentPage - 1, currentSize)
    );
    paginationContainer.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if (i === currentPage) {
        btn.style.backgroundColor = "#3498db";
        btn.style.color = "#fff";
      }
      btn.addEventListener("click", () => fetchUsers(i, currentSize));
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Trang sau";
    next.disabled = currentPage === totalPages - 1;
    next.addEventListener("click", () =>
      fetchUsers(currentPage + 1, currentSize)
    );
    paginationContainer.appendChild(next);
  }

  // Khi nhấn vào tab users
  userLink.addEventListener("click", () => {
    currentPage = 0;
    currentSize = parseInt(pageSizeSelect.value);
    fetchUsers(currentPage, currentSize);
  });

  // Khi thay đổi số user/trang
  pageSizeSelect.addEventListener("change", () => {
    currentSize = parseInt(pageSizeSelect.value);
    fetchUsers(0, currentSize);
  });
});
