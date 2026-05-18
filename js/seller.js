loadComponent("navbar", "navbar.html");
loadComponent("footer", "footer.html");

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("productList");
  const sellerProducts = [...products];

  function render() {
    list.innerHTML = sellerProducts.map(p => `
      <div class="card">
        <img src="${p.image}" width="100%">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
      </div>
    `).join('');
  }

  render();
});
