
document.addEventListener("DOMContentLoaded", function () {
  const pageSizeSelect = document.getElementById("user-page-size");
  const roleFilter = document.getElementById("filter-role");
  const userLink = document.querySelector('a[href="#users"]');
  const paginationContainer = document.getElementById("user-pagination");
  const tbody = document.getElementById("user-table-body");

  const addUserBtn = document.getElementById("add-new-user");
  const userModal = document.getElementById("add-user-modal");
  const closeBtn = document.querySelector(".close-user-btn");
  const addUserForm = document.getElementById("add-user-form");

  const editModal = document.getElementById("edit-user-modal");
  const editForm = document.getElementById("edit-user-form");
  const closeEditBtn = document.querySelector(".close-user-edit-btn");

  let currentPage = 0;
  let currentSize = parseInt(pageSizeSelect.value);
  let currentRole = "";

  function fetchUsers(page = 0, size = 10, role = "") {
    currentPage = page;
    currentSize = size;
    currentRole = role;

    const token = localStorage.getItem("token");
    let url = `http://localhost:8080/api/users`;

    if (role) {
      url = `http://localhost:8080/api/users/role?role=${role}&page=${page}&size=${size}`;
    } else {
      url += `?page=${page}&size=${size}`;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi tải danh sách người dùng");
        return res.json();
      })
      .then((data) => {
        renderUsers(data.content);
        renderUserPagination(data.page.totalPages, data.page.number);
      })
      .catch((err) => alert("Lỗi: " + err.message));
  }

  function renderUsers(users) {
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
          <button 
            class="edit-btn" 
            data-id="${u.id}" 
            data-username="${u.userName}" 
            data-firstname="${u.firstName}" 
            data-lastname="${u.lastName}" 
            data-birthdate="${u.birthDate}" 
            data-email="${u.email}" 
            data-role="${u.role}"
          >
            <i class="fa-solid fa-pen-to-square"></i> Cập nhật
          </button>
          <button 
            class="delete-btn" 
            data-id="${u.id}"
          >
          <i class="fa-solid fa-trash-can"></i> Xóa</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Function update user, delete user
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editModal.classList.remove("hidden");
        editForm.elements["id"].value = btn.dataset.id;
        editForm.elements["userName"].value = btn.dataset.username;
        editForm.elements["firstName"].value = btn.dataset.firstname;
        editForm.elements["lastName"].value = btn.dataset.lastname;
        editForm.elements["birthDate"].value = btn.dataset.birthdate;
        editForm.elements["email"].value = btn.dataset.email;
        editForm.elements["role"].value = btn.dataset.role;
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
          const token = localStorage.getItem("token");
          fetch(`http://localhost:8080/api/users/${btn.dataset.id}`, {
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
        }
      });
    });
  }

  function renderUserPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = "";

    const prev = document.createElement("button");
    prev.textContent = "Trang trước";
    prev.disabled = currentPage === 0;
    prev.addEventListener("click", () =>
      fetchUsers(currentPage - 1, currentSize, currentRole)
    );
    paginationContainer.appendChild(prev);

    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i + 1;
      if (i === currentPage) {
        btn.style.backgroundColor = "#F16767";
        btn.style.color = "#fff";
      }
      btn.addEventListener("click", () => fetchUsers(i, currentSize, currentRole));
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "Trang sau";
    next.disabled = currentPage === totalPages - 1;
    next.addEventListener("click", () =>
      fetchUsers(currentPage + 1, currentSize, currentRole)
    );
    paginationContainer.appendChild(next);
  }

  // Modal thêm user
  addUserBtn.addEventListener("click", () => {
    userModal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    userModal.classList.add("hidden");
  });

  addUserForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData(addUserForm);

    const newUser = {
      userName: formData.get("userName"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      birthDate: formData.get("birthDate"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    fetch("http://localhost:8080/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể thêm người dùng!");
        return res.json();
      })
      .then(() => {
        alert("Thêm người dùng thành công!");
        userModal.classList.add("hidden");
        addUserForm.reset();
        fetchUsers(currentPage, currentSize, currentRole);
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

    const updatedUser = {
      userName: editForm.elements["userName"].value,
      firstName: editForm.elements["firstName"].value,
      lastName: editForm.elements["lastName"].value,
      birthDate: editForm.elements["birthDate"].value,
      email: editForm.elements["email"].value,
      role: editForm.elements["role"].value,
    };

    const userId = editForm.elements["id"].value;

    fetch(`http://localhost:8080/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Cập nhật thông tin thất bại!");
      })
      .then(() => {
        alert("Cập nhật thông tin thành công!");
        editModal.classList.add("hidden");
        fetchUsers(currentPage, currentSize, currentRole);
      })
      .catch((err) => alert("Lỗi: " + err.message));
  });

  // Filter role
  roleFilter.addEventListener("change", () => {
    const selectedRole = roleFilter.value;
    fetchUsers(0, currentSize, selectedRole); 
  });

  // Khi thay đổi số user/trang
  pageSizeSelect.addEventListener("change", () => {
    currentSize = parseInt(pageSizeSelect.value);
    fetchUsers(0, currentSize, currentRole);
  });

  // Khi nhấn vào tab users
  userLink.addEventListener("click", () => {
    currentPage = 0;
    currentSize = parseInt(pageSizeSelect.value);
    fetchUsers(currentPage, currentSize);
  });
  
});
