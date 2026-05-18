//This is component reuse but done manually 
function loadComponent(id, file) {
  fetch(`/components/${file}`)
    .then(resp => resp.text())
    .then(html => document.getElementById(id).innerHTML = html);
}

// Simple session in memory
const session = { currentUser: null };

// Toasts
function showToast(msg) {
  alert(msg);
}

// ===== CART HELPERS =====

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = count;
}