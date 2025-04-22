document.addEventListener("DOMContentLoaded", function () {
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  const token = localStorage.getItem("token");
  function countProduct() {
    fetch("http://localhost:8080/api/products/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((count) => {
        document.getElementById(
          "product-count"
        ).innerHTML = `Tổng số sản phẩm: <strong>${count}</strong>`;
      });
  }

  //Sau khi thay đổi số lượng, khi click lại trang đầu sẽ đổi
  dashboardLink.addEventListener("click", () => {
    countProduct();
  });

  // Load mỗi khi đăng nhập
  countProduct()
});
