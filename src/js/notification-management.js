function fetchNotifications() {
  const token = localStorage.getItem("token");

  fetch("http://localhost:8080/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      const unreadList = document.getElementById("unread-list");
      const readList = document.getElementById("read-list");
      const badge = document.getElementById("noti-badge-count");

      unreadList.innerHTML = "";
      readList.innerHTML = "";

      const unread = data.filter(n => !n.read);
      const read = data.filter(n => n.read);

      // Badge
      badge.textContent = unread.length;
      badge.style.display = unread.length > 0 ? "inline-block" : "none";

      // Unread section
      if (unread.length === 0) {
        unreadList.innerHTML = "<li style='color: gray;'>Không có thông báo.</li>";
      } else {
        unread.forEach(noti => {
          const li = createNotificationItem(noti, false); // chưa đọc
          unreadList.appendChild(li);
        });
      }

      // Read section
      if (read.length === 0) {
        readList.innerHTML = "<li style='color: gray;'>Không có thông báo.</li>";
      } else {
        read.forEach(noti => {
          const li = createNotificationItem(noti, true); // đã đọc
          readList.appendChild(li);
        });
      }
    });
}

function createNotificationItem(noti, isRead) {
  const li = document.createElement("li");

  li.className = "notification-item";
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.gap = "10px";
  li.style.cursor = "pointer";
  li.style.fontWeight = isRead ? "normal" : "bold";

  const message = document.createElement("span");
  message.textContent = noti.createdAt + noti.message;
  message.onclick = () => {
    if (!isRead) {
      markAsRead(noti.id, li);
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteBtn.style.background = "none";
  deleteBtn.style.border = "none";
  deleteBtn.style.color = "red";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.title = "Xóa thông báo";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteNotification(noti.id);
  };

  li.appendChild(message);
  li.appendChild(deleteBtn);
  return li;
}

function markAsRead(id, liElement) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:8080/api/notifications/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(() => {
    // Gỡ in đậm và chuyển xuống danh sách đã đọc
    const readList = document.getElementById("read-list");
    liElement.style.fontWeight = "normal";
    document.getElementById("unread-list").removeChild(liElement);
    readList.appendChild(liElement);

    // Giảm badge
    const badge = document.getElementById("noti-badge-count");
    let current = parseInt(badge.textContent);
    badge.textContent = current > 0 ? current - 1 : 0;
    badge.style.display = parseInt(badge.textContent) > 0 ? "inline-block" : "none";
  });
}

function deleteNotification(id) {

  const confirmDelete = confirm(
    "Bạn có chắc chắn muốn xóa thông báo này?"
  );
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  fetch(`http://localhost:8080/api/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(res => {
    if (res.ok) {
      alert("Xóa thành công");
      fetchNotifications();
    }
  });
}

function markAllAsRead() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/api/notifications/read-all", {
    method: "PUT", 
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (res.ok) {
        fetchNotifications(); // Chờ đánh dấu xong rồi mới reload
      } else {
        console.error("Không thể đánh dấu tất cả là đã đọc");
      }
    })
    .catch(error => console.error("Lỗi:", error));
}

function goToDashboard() {
  document.querySelectorAll("section").forEach(section => {
    section.style.display = "none";
  });
  document.getElementById("dashboard").style.display = "block";
}

// Auto fetch after 10s
setInterval(fetchNotifications, 10000);
fetchNotifications();
