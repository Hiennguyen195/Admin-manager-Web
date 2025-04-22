const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // ngăn form reload

  const userName = document.getElementById("userName").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password })
  })
    .then(res => {
      if (!res.ok) throw new Error("Thông tin đăng nhập không đúng!");
      return res.json();
    })
    .then(data => {
      //console.log("Token nhận được từ backend:", data.result.token);//
      localStorage.setItem("token", data.result.token); // lưu JWT
      window.location.href = "./admin.html"; // chuyển trang
    })
    .catch(err => {
      errorMsg.textContent = err.message;
    });
});
