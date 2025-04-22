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
          // console.log("User object:", u);

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
              <i class="fa-solid fa-pen-to-square"></i> Cập nhập</button>
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

        document.querySelectorAll(".edit-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const editModal = document.getElementById("edit-user-modal");
            const editForm = document.getElementById("edit-user-form");

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

        createPagination(data.page.totalPages, data.page.number);
      })
      .catch((err) => {
        console.error("Lỗi tải user:", err.message);
        alert("Đã có lỗi xảy ra khi tải danh sách người dùng.");
      });
  }

  // Function phân trang
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
        btn.style.backgroundColor = "#F16767";
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

  // Render bảng chứa thông tin user
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
                data-birthnate="${u.birthDate}" 
                data-email="${u.email}"
                data-role="${u.role}"
              >
              <i class="fa-solid fa-pen-to-square"></i> Cập nhập</button>
              <button class="delete-btn" data-id="${u.id}"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            </td>
      `;
      tbody.appendChild(row);
    });
  }

  // Lọc người dùng theo role
  function fetchUsersByRole(role, page = 0, size = 10) {
    const token = localStorage.getItem("token");

    fetch(
      `http://localhost:8080/api/users/role?role=${role}&page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        renderUsers(data.content); // Hiển thị danh sách user
        createPagination(data.totalPages, page); // Render phân trang
      })
      .catch((err) => console.error("Error fetching users:", err));
  }

  //Gọi filter by role
  const roleFilter = document.getElementById("filter-role");

  roleFilter.addEventListener("change", () => {
    const selectedRole = roleFilter.value;
    if (selectedRole) {
      fetchUsersByRole(selectedRole, 0, currentSize);
    } else {
      fetchUsers(0, currentSize); // load lại tất cả nếu không chọn role
    }
  });


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

  // Modal thêm user
  const userModal = document.getElementById("add-user-modal");
  const addUserBtn = document.getElementById("add-new-user");
  const closeBtn = document.querySelector(".close-user-btn");
  const addUserForm = document.getElementById("add-user-form");

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
      })
      .then(() => {
        alert("Thêm người dùng thành công!");
        userModal.classList.add("hidden");
        addUserForm.reset();
        fetchUsers(currentPage, currentSize);
      })
      .catch((err) => {
        alert("Lỗi: " + err.message);
      });
  });

  // Cập nhập thông tin người dùng
  const editModal = document.getElementById("edit-user-modal");
  const editForm = document.getElementById("edit-user-form");
  const closeEditBtn = document.querySelector(".close-user-edit-btn");

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
        // return res.json();
      })
      .then(() => {
        alert("Cập nhật thông tin thành công!");
        editModal.classList.add("hidden");
        fetchUsers(currentPage, currentSize);
      })
      .catch((err) => {
        alert("Lỗi: " + err.message);
      });
  });


  
});
