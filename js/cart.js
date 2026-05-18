loadComponent("navbar", "navbar.html");
loadComponent("footer", "footer.html");

document.addEventListener("DOMContentLoaded", () => {
  // ── DOM refs ──
  const cartItemsEl   = document.getElementById("cartItems");
  const emptyStateEl  = document.getElementById("emptyState");
  const itemCountEl   = document.getElementById("itemCount");
  const summaryCount  = document.getElementById("summaryCount");
  const summarySubtot = document.getElementById("summarySubtotal");
  const summaryShip   = document.getElementById("summaryShipping");
  const cartTotalEl   = document.getElementById("cartTotal");
  const checkoutBtn   = document.getElementById("checkoutBtn");
  const checkoutCount = document.getElementById("checkoutCount");
  const selectAllEl   = document.getElementById("selectAll");
  const deleteSelBtn  = document.getElementById("deleteSelected");
  const discountRow   = document.getElementById("discountRow");
  const summaryDisc   = document.getElementById("summaryDiscount");
  const savingsBanner = document.getElementById("savingsBanner");
  const savingsAmt    = document.getElementById("savingsAmount");
  const voucherInput  = document.getElementById("voucherInput");
  const applyVoucher  = document.getElementById("applyVoucher");
  const voucherMsg    = document.getElementById("voucherMsg");
  const toastEl       = document.getElementById("toast");

  // ── State ──
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let selectedIds = new Set();
  let appliedDiscount = 0;

  // Demo voucher codes
  const VOUCHERS = {
    "SAVE10": 0.10,
    "SAVE20": 0.20,
    "FREESHIP": 0,
  };

  // ── Utilities ──
  function fmt(n) {
    return "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  // ── Render ──
  function render() {
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      emptyStateEl.classList.add("visible");
      updateSummary();
      return;
    }

    emptyStateEl.classList.remove("visible");

    cart.forEach((item, index) => {
      const isChecked = selectedIds.has(item.id ?? index);
      const qty = item.qty || 1;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.dataset.index = index;

      div.innerHTML = `
        <label class="custom-check item-check">
          <input type="checkbox" class="item-checkbox" data-index="${index}" ${isChecked ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>

        <div class="item-img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
            : `🛍️`}
        </div>

        <div class="item-info">
          <p class="item-name">${item.name}</p>
          ${item.variant ? `<span class="item-variant">${item.variant}</span>` : ""}
          <div style="display:flex; align-items:baseline; gap:8px; margin-top:4px;">
            <span class="item-price">${fmt(item.price)}</span>
            ${item.originalPrice ? `<span class="item-original-price">${fmt(item.originalPrice)}</span>` : ""}
          </div>
        </div>

        <div class="item-actions">
          <div>
            <p class="item-subtotal">${fmt(item.price * qty)}</p>
            <p class="item-subtotal-label">Subtotal</p>
          </div>
          <div class="qty-stepper">
            <button class="qty-btn btn-minus" data-index="${index}" ${qty <= 1 ? "disabled" : ""}>−</button>
            <input class="qty-value" type="number" value="${qty}" min="1" max="99" data-index="${index}">
            <button class="qty-btn btn-plus" data-index="${index}" ${qty >= 99 ? "disabled" : ""}>+</button>
          </div>
          <button class="btn-remove-item" data-index="${index}">✕ Remove</button>
        </div>
      `;

      cartItemsEl.appendChild(div);
    });

    attachItemListeners();
    updateSummary();
    syncSelectAll();
  }

  // ── Item listeners ──
  function attachItemListeners() {
    // Checkboxes
    document.querySelectorAll(".item-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const i = +cb.dataset.index;
        const id = cart[i]?.id ?? i;
        cb.checked ? selectedIds.add(id) : selectedIds.delete(id);
        syncSelectAll();
        updateSummary();
      });
    });

    // Qty minus
    document.querySelectorAll(".btn-minus").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.index;
        if (cart[i].qty > 1) {
          cart[i].qty--;
          saveCart();
          render();
        }
      });
    });

    // Qty plus
    document.querySelectorAll(".btn-plus").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.index;
        if ((cart[i].qty || 1) < 99) {
          cart[i].qty = (cart[i].qty || 1) + 1;
          saveCart();
          render();
        }
      });
    });

    // Qty input
    document.querySelectorAll(".qty-value").forEach(input => {
      input.addEventListener("change", () => {
        const i = +input.dataset.index;
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 99) val = 99;
        cart[i].qty = val;
        saveCart();
        render();
      });
    });

    // Remove
    document.querySelectorAll(".btn-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.index;
        const name = cart[i].name;
        const card = btn.closest(".cart-item");
        card.classList.add("removing");
        setTimeout(() => {
          const id = cart[i]?.id ?? i;
          selectedIds.delete(id);
          cart.splice(i, 1);
          saveCart();
          render();
          showToast(`"${name}" removed from cart`);
        }, 280);
      });
    });
  }

  function updateSummary() {
  // how many items are CHECKED
  const selectedCount = selectedIds.size;

  itemCountEl.textContent = selectedCount;
  summaryCount.textContent = selectedCount;
  checkoutCount.textContent = selectedCount;

  // compute subtotal ONLY from selected items
  let subtotal = 0;

  cart.forEach((item, i) => {
    const id = item.id ?? i;
    if (selectedIds.has(id)) {
      subtotal += item.price * (item.qty || 1);
    }
  });

  const discount = appliedDiscount > 0 ? subtotal * appliedDiscount : 0;
  const finalTotal = subtotal - discount;

  summarySubtot.textContent = fmt(subtotal);
  cartTotalEl.textContent = fmt(finalTotal);
  summaryShip.textContent = subtotal > 0 ? "FREE" : "₱0.00";

  // voucher visuals
  if (discount > 0) {
    discountRow.classList.add("visible");
    summaryDisc.textContent = `-${fmt(discount)}`;
    savingsBanner.classList.add("visible");
    savingsAmt.textContent = fmt(discount);
  } else {
    discountRow.classList.remove("visible");
    savingsBanner.classList.remove("visible");
  }

  // disable checkout if nothing selected
  checkoutBtn.disabled = selectedCount === 0;
}

  // ── Select All ──
  selectAllEl.addEventListener("change", () => {
    if (selectAllEl.checked) {
      cart.forEach((item, i) => selectedIds.add(item.id ?? i));
    } else {
      selectedIds.clear();
    }
    render();
  });

  function syncSelectAll() {
    if (cart.length === 0) {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = false;
    } else if (selectedIds.size === 0) {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = false;
    } else if (selectedIds.size === cart.length) {
      selectAllEl.checked = true;
      selectAllEl.indeterminate = false;
    } else {
      selectAllEl.checked = false;
      selectAllEl.indeterminate = true;
    }
  }

  // ── Delete selected ──
  deleteSelBtn.addEventListener("click", () => {
    if (selectedIds.size === 0) {
      showToast("No items selected");
      return;
    }
    const count = selectedIds.size;
    cart = cart.filter((item, i) => !selectedIds.has(item.id ?? i));
    selectedIds.clear();
    saveCart();
    render();
    showToast(`${count} item${count > 1 ? "s" : ""} removed`);
  });

  // ── Voucher ──
  applyVoucher.addEventListener("click", () => {
    const code = voucherInput.value.trim().toUpperCase();
    if (!code) {
      voucherMsg.textContent = "Please enter a voucher code.";
      voucherMsg.className = "voucher-msg error";
      return;
    }
    if (VOUCHERS[code] !== undefined) {
      appliedDiscount = VOUCHERS[code];
      voucherMsg.textContent = appliedDiscount > 0
        ? `✓ ${(appliedDiscount * 100).toFixed(0)}% discount applied!`
        : "✓ Free shipping applied!";
      voucherMsg.className = "voucher-msg success";
      updateSummary();
    } else {
      voucherMsg.textContent = "Invalid voucher code.";
      voucherMsg.className = "voucher-msg error";
    }
  });

  voucherInput.addEventListener("keydown", e => {
    if (e.key === "Enter") applyVoucher.click();
  });

  // ── Checkout ──
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    showToast("Proceeding to checkout…");
    // window.location.href = "checkout.html";
  });

  // ── Init ──
  // Ensure every item has an id
  cart = cart.map((item, i) => ({ id: item.id ?? i, qty: item.qty || 1, ...item }));
  render();
});