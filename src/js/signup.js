document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const userName = document.getElementById("userName").value.trim();
    const password = document.getElementById("password").value;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const birthDate = document.getElementById("birthDate").value;
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
  
    const data = { userName, password, firstName, lastName, birthDate, email, role };
  
    console.log("Data đăng ký gửi lên:", data);
  
    // Gửi lên API backend của bạn
    fetch("http://localhost:8080/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
      console.log(result);
      alert("Đăng ký thành công!");
      // window.location.href = "./login.html";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("error-msg").textContent = "Đăng ký thất bại!";
    });
  });
  