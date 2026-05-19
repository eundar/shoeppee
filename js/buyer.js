loadComponent("navbar", "navbar.html").then(() => {
  updateCartCount();
});
loadComponent("footer", "footer.html");

document.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("productGrid");

  // ── Modal setup ──────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "productOverlay";
  overlay.className = "product-overlay";
  overlay.innerHTML = `
    <div class="product-modal" id="productModal">
      <button class="modal-close" id="modalClose">✕</button>

      <div class="modal-img-wrap">
        <img id="mImg" src="" alt="">
        <span class="modal-badge" id="mBadge" style="display:none">🔥 Popular</span>
      </div>

      <div class="modal-body">
        <span class="modal-category" id="mCategory"></span>
        <h2 class="modal-title" id="mName"></h2>

        <div class="modal-meta">
          <span class="modal-price" id="mPrice"></span>
          <div class="modal-rating">
            <span class="modal-stars" id="mStars"></span>
            <span class="modal-rating-num" id="mRatingNum"></span>
          </div>
        </div>

        <p class="modal-desc" id="mDesc"></p>

        <div class="modal-reviews" id="mReviews"></div>

        <button class="btn add-to-cart modal-add-btn" id="mAddBtn">Add to Cart 🛒</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function renderStars(rating) {
    const filled = Math.round(rating);
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  }

  function openModal(prod) {
    document.getElementById("mImg").src = prod.image;
    document.getElementById("mImg").alt = prod.name;
    document.getElementById("mCategory").textContent =
      prod.category.charAt(0).toUpperCase() + prod.category.slice(1);
    document.getElementById("mName").textContent = prod.name;
    document.getElementById("mPrice").textContent =
      "₱" + prod.price.toLocaleString();
    document.getElementById("mStars").textContent = renderStars(prod.rating || 0);
    document.getElementById("mRatingNum").textContent =
      prod.rating ? `${prod.rating} (${(prod.reviews || []).length} reviews)` : "No ratings yet";
    document.getElementById("mDesc").textContent =
      prod.description || "No description available.";

    const badge = document.getElementById("mBadge");
    badge.style.display = topPopularIds.includes(prod.id) ? "inline-block" : "none";

    const reviewsEl = document.getElementById("mReviews");
    const reviews = prod.reviews || [];
    reviewsEl.innerHTML = reviews.length
      ? `<h4 class="reviews-heading">Customer Reviews</h4>` +
        reviews.map(r => `
          <div class="review-card">
            <div class="review-header">
              <span class="reviewer-name">${r.user}</span>
              <span class="review-stars">${renderStars(r.stars)}</span>
            </div>
            <p class="review-text">${r.comment}</p>
            <span class="review-date">${r.date || ""}</span>
          </div>
        `).join("")
      : `<p class="no-reviews">No reviews yet.</p>`;

    document.getElementById("mAddBtn").onclick = () => {
      addToCart(prod);
      updateCartCount();
      document.getElementById("mAddBtn").textContent = "✓ Added!";
      setTimeout(() => {
        document.getElementById("mAddBtn").textContent = "Add to Cart 🛒";
      }, 1500);
    };

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // ── Sorting & popularity ──────────────────────────────────────
  let currentSort = "popular";

  function sortProducts(list) {
    if (currentSort === "popular")
      return [...list].sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
    if (currentSort === "priceLow")
      return [...list].sort((a, b) => a.price - b.price);
    if (currentSort === "priceHigh")
      return [...list].sort((a, b) => b.price - a.price);
    return list;
  }

  function getPopularityScore(prod) {
    return (prod.purchases || 0) * 5 + (prod.views || 0) * 1 + (prod.rating || 0) * 10;
  }

  function getTopPopular(list) {
    return [...list]
      .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
      .slice(0, 3)
      .map(p => p.id);
  }

  let topPopularIds = getTopPopular(products);

  // ── Render ────────────────────────────────────────────────────
  function renderProducts(list) {
    grid.innerHTML = "";
    const sortedList = sortProducts(list);
    topPopularIds = getTopPopular(sortedList);

    sortedList.forEach(prod => {
      const card = document.createElement("div");
      card.className = "card product-card";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <div class="image-container">
          ${topPopularIds.includes(prod.id) ? '<span class="badge">🔥 Popular</span>' : ""}
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="product-info">
          <h3>${prod.name}</h3>
          <p>₱${prod.price}</p>
          <button class="btn add-to-cart">Add to Cart</button>
        </div>
      `;

      // Card click → open modal (but not when clicking the button)
      card.addEventListener("click", e => {
        if (!e.target.classList.contains("add-to-cart")) openModal(prod);
      });

      card.querySelector(".add-to-cart").addEventListener("click", e => {
        e.stopPropagation();
        addToCart(prod);
        updateCartCount();
        alert(`${prod.name} added to cart 🛒`);
      });

      grid.appendChild(card);
    });
  }

  renderProducts(products);

  // ── Filters & search ──────────────────────────────────────────
  document.getElementById("searchBar").addEventListener("input", e => {
    const val = e.target.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(val)));
  });

  document.querySelectorAll(".filters .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      renderProducts(cat === "all" ? products : products.filter(p => p.category === cat));
    });
  });

  document.getElementById("sortSelect").addEventListener("change", e => {
    currentSort = e.target.value;
    renderProducts(products);
  });

});