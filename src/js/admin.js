document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".sidebar a");
  const sections = document.querySelectorAll(".main section");
  const token = localStorage.getItem("token")

  fetch("http://localhost:8080/api/auth/introspect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }), // Gửi token vào body
  })
    .then((res) => {
      if (!res.ok) throw new Error("Token hết hạn hoặc không hợp lệ");
    })
    .catch(() => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // If logout, changing page
      if (href === "./login.html") {
        return;
      }

      e.preventDefault(); // Prevent changing if it is a tab

      // Tab execute
      links.forEach(l => l.classList.remove("active"));
      this.classList.add("active");

      const targetId = href.substring(1); // Remove "#"
      sections.forEach(sec => {
        sec.style.display = "none";
      });

      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.style.display = "block";
      }

      const logoutLink = document.querySelector(".logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      // Clear session
      sessionStorage.clear(); localStorage.clear();

      // Back to login page
      window.location.href = this.getAttribute("href");
    });
  }
    });
  });
});

