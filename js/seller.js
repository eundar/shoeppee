loadComponent("navbar", "navbar.html");
loadComponent("footer", "footer.html");

document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const totalProductsEl = document.getElementById("totalProducts");
  const totalSalesEl = document.getElementById("totalSales");
  const totalOrdersEl = document.getElementById("totalOrders");
  const lowStockEl = document.getElementById("lowStockCount");
  const searchInput = document.getElementById("searchProduct");

  const modal = document.getElementById("productModal");
  const addBtn = document.getElementById("addProductBtn");
  const closeModal = document.getElementById("closeModal");
  const saveProduct = document.getElementById("saveProduct");

  // ===== GET PRODUCTS (data.js + added products) =====
  function getAllProducts() {
    const added = JSON.parse(localStorage.getItem("addedProducts")) || [];
    return [...products, ...added];
  }

  function getMyProducts() {
    return getAllProducts().filter(p => p.seller === "MangBen");
  }

  // ===== STATS =====
  function renderStats(list) {
    totalProductsEl.textContent = list.length;

    const lowStock = list.filter(p => p.stock < 50).length;
    lowStockEl.textContent = lowStock;

    const totalSales = list.reduce((sum, p) => sum + (p.price * p.purchases), 0);
    totalSalesEl.textContent = "₱" + totalSales.toLocaleString();

    const totalOrders = list.reduce((sum, p) => sum + p.purchases, 0);
    totalOrdersEl.textContent = totalOrders;
  }

  // ===== RENDER =====
  function renderProducts(list) {
    productList.innerHTML = "";

    if (list.length === 0) {
      productList.innerHTML = "<p>No products found.</p>";
      return;
    }

    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";

      if (p.stock < 50) card.classList.add("low-stock");

      card.innerHTML = `
        ${p.stock < 50 ? `<div class="stock-badge">LOW STOCK</div>` : ""}
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>₱${p.price.toLocaleString()}</p>
        <p>Stock: <span class="${p.stock < 50 ? 'stock-low' : ''}">${p.stock}</span></p>
        <p>Purchases: ${p.purchases}</p>
      `;

      card.addEventListener("click", () => openViewModal(p));
      productList.appendChild(card);
    });

  }

  // ===== VIEW MODAL =====
  const viewModal = document.getElementById("viewModal");
  const closeView = document.getElementById("closeView");

  function openViewModal(p) {
    document.getElementById("viewImage").src = p.image;
    document.getElementById("viewName").textContent = p.name;
    document.getElementById("viewPrice").textContent = "Price: ₱" + p.price.toLocaleString();
    document.getElementById("viewStock").textContent = "Stock: " + p.stock;
    document.getElementById("viewPurchases").textContent = "Purchases: " + p.purchases;
    document.getElementById("viewCategory").textContent = "Category: " + p.category;

    viewModal.style.display = "flex";
  }

  closeView.onclick = () => viewModal.style.display = "none";
  window.onclick = (e) => {
    if (e.target === viewModal) viewModal.style.display = "none";
  };

  // ===== SEARCH =====
  searchInput.addEventListener("input", () => {
    const val = searchInput.value.toLowerCase();
    const filtered = getMyProducts().filter(p =>
      p.name.toLowerCase().includes(val)
    );
    renderProducts(filtered);
    renderStats(filtered);
  });

  // ===== MODAL =====
  addBtn.onclick = () => modal.style.display = "flex";
  closeModal.onclick = () => modal.style.display = "none";

  // ===== SAVE PRODUCT =====
  saveProduct.onclick = () => {
    const newProduct = {
      id: Date.now(),
      name: document.getElementById("pName").value,
      price: Number(document.getElementById("pPrice").value),
      category: document.getElementById("pCategory").value,
      image: document.getElementById("pImage").value,
      seller: "MangBen",
      purchases: 0,
      rating: 0,
      reviews: 0,
      stock: Number(document.getElementById("pStock").value),
    };

    const added = JSON.parse(localStorage.getItem("addedProducts")) || [];
    added.push(newProduct);
    localStorage.setItem("addedProducts", JSON.stringify(added));

    modal.style.display = "none";

    const myProducts = getMyProducts();
    renderProducts(myProducts);
    renderStats(myProducts);
  };

  // ===== INITIAL LOAD =====
  const myProducts = getMyProducts();
  renderProducts(myProducts);
  renderStats(myProducts);
});