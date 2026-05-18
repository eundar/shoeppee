//“Find the div with id navbar and inject navbar.html into it.”
loadComponent("navbar", "navbar.html").then(() => {
  updateCartCount();
});
loadComponent("footer", "footer.html");

//“Don’t run anything until ALL HTML is fully loaded.”
document.addEventListener("DOMContentLoaded", () => {

  //grabs the container with ID productGrid
  const grid = document.getElementById("productGrid");

  let currentSort = "popular";

  function sortProducts(list) {
  if (currentSort === "popular") {
    return [...list].sort(
      (a, b) => getPopularityScore(b) - getPopularityScore(a)
    );
  }

  if (currentSort === "priceLow") {
    return [...list].sort((a, b) => a.price - b.price);
  }

  if (currentSort === "priceHigh") {
    return [...list].sort((a, b) => b.price - a.price);
  }

  return list;
}

  function getPopularityScore(prod) {
    const purchases = prod.purchases || 0;
    const views = prod.views || 0;
    const rating = prod.rating || 0;

    return (purchases * 5) + (views * 1) + (rating * 10);
  }

  function getTopPopular(products) {
    return [...products] // copy array
      .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
      .slice(0, 3)
      .map(p => p.id); // we only need IDs
  }

  let topPopularIds = getTopPopular(products);

  function renderProducts(list) {
    grid.innerHTML = "";

    const sortedList = sortProducts(list);

    topPopularIds = getTopPopular(sortedList);
    
    sortedList.forEach(prod => {
      const card = document.createElement("div");
      card.className = "card product-card";
      card.innerHTML = `
        <div class="image-container">
          ${topPopularIds.includes(prod.id) ? '<span class="badge">🔥 Popular</span>' : ''}
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="product-info">
          <h3>${prod.name}</h3>
          <p>$${prod.price}</p>
          <button class="btn add-to-cart">Add to Cart</button>
        </div>
      `;
      grid.appendChild(card);
      
      //add to cart event listener
      card.querySelector(".add-to-cart").addEventListener("click", () => {
        addToCart(prod);
        updateCartCount(); 
        alert(`${prod.name} added to cart 🛒`);
      });
    });
  }

  renderProducts(products);

  document.getElementById("searchBar").addEventListener("input", e => {
    const val = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(val));
    renderProducts(filtered);
  });

  document.querySelectorAll(".filters .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.category;
      renderProducts(cat === "all" ? products : products.filter(p => p.category === cat));
    });
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderProducts(products);
  });

});
