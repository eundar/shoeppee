// ── orders.js ──
// Handles the Orders modal on the Seller Dashboard.
// Orders are read from localStorage key "orders" (array of order objects).
// Each order: { id, date, customerName, status, items: [{name, qty, price}] }



document.addEventListener("DOMContentLoaded", () => {
  const ordersModal  = document.getElementById("ordersModal");
  const ordersList   = document.getElementById("ordersList");
  const ordersEmpty  = document.getElementById("ordersEmpty");
  const closeOrders  = document.getElementById("closeOrders");
  const viewOrdersBtn = document.getElementById("viewOrdersBtn");
  const ordersStatCard = document.getElementById("ordersStatCard");
  const tabs         = document.querySelectorAll(".orders-tab");

  let currentFilter = "all";

  // ── Open / Close ──
  function openOrders() {
    renderOrders(currentFilter);
    ordersModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeOrdersModal() {
    ordersModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  viewOrdersBtn?.addEventListener("click", openOrders);
  ordersStatCard?.addEventListener("click", openOrders);
  closeOrders?.addEventListener("click", closeOrdersModal);
  ordersModal?.addEventListener("click", e => {
    if (e.target === ordersModal) closeOrdersModal();
  });

  // ── Tab filtering ──
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.status;
      renderOrders(currentFilter);
    });
  });

  // ── Render ──
  function renderOrders(filter) {
    const orders = getOrders();
    const filtered = filter === "all"
      ? orders
      : orders.filter(o => o.status === filter);

    ordersList.innerHTML = "";

    if (filtered.length === 0) {
      ordersEmpty.style.display = "flex";
      ordersList.style.display = "none";
      return;
    }

    ordersEmpty.style.display = "none";
    ordersList.style.display = "flex";

    filtered.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card";

      const orderTotal = order.items
        ? order.items.reduce((s, i) => s + i.price * (i.qty || 1), 0)
        : 0;

      const statusClass = {
        pending:    "status-pending",
        processing: "status-processing",
        shipped:    "status-shipped",
        completed:  "status-completed",
      }[order.status] || "status-pending";

      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <span class="order-id">#${order.id}</span>
            <span class="order-date">${formatDate(order.date)}</span>
          </div>
          <span class="order-status ${statusClass}">${capitalize(order.status || "pending")}</span>
        </div>

        <div class="order-customer">
          <span>👤</span> ${order.customerName || "Anonymous"}
        </div>

        <ul class="order-items">
          ${(order.items || []).map(item => `
            <li>
              <span class="oi-name">${item.name}</span>
              <span class="oi-meta">×${item.qty || 1} — ₱${fmt(item.price * (item.qty || 1))}</span>
            </li>
          `).join("")}
        </ul>

        <div class="order-card-footer">
          <span class="order-total">Total: <strong>₱${fmt(orderTotal)}</strong></span>
          <div class="order-actions">
            <select class="status-select" data-id="${order.id}">
              <option value="pending"    ${order.status === "pending"    ? "selected" : ""}>Pending</option>
              <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
              <option value="shipped"    ${order.status === "shipped"    ? "selected" : ""}>Shipped</option>
              <option value="completed"  ${order.status === "completed"  ? "selected" : ""}>Completed</option>
            </select>
          </div>
        </div>
      `;

      ordersList.appendChild(card);
    });

    // Status change listeners
    document.querySelectorAll(".status-select").forEach(sel => {
      sel.addEventListener("change", () => {
        updateOrderStatus(sel.dataset.id, sel.value);
        renderOrders(currentFilter);
      });
    });
  }

  // ── Data helpers ──
  function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || sampleOrders();
  }

  function updateOrderStatus(id, status) {
    const orders = getOrders();
    const order = orders.find(o => String(o.id) === String(id));
    if (order) {
      order.status = status;
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }

  function fmt(n) {
    return Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ── Sample data (shown when localStorage is empty) ──
  function sampleOrders() {
    return [
      {
        id: "ORD-001",
        date: new Date(Date.now() - 86400000).toISOString(),
        customerName: "Maria Santos",
        status: "pending",
        items: [
          { name: "Air Max Classic", qty: 1, price: 3200 },
          { name: "Running Pro", qty: 2, price: 1800 },
        ],
      },
      {
        id: "ORD-002",
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        customerName: "Juan dela Cruz",
        status: "shipped",
        items: [
          { name: "Casual Slip-On", qty: 1, price: 1200 },
        ],
      },
      {
        id: "ORD-003",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        customerName: "Ana Reyes",
        status: "completed",
        items: [
          { name: "Sport Racer X", qty: 1, price: 4500 },
          { name: "Ankle Socks Pack", qty: 3, price: 250 },
        ],
      },
      {
        id: "ORD-004",
        date: new Date().toISOString(),
        customerName: "Carlo Mendoza",
        status: "processing",
        items: [
          { name: "Canvas Low-Top", qty: 2, price: 950 },
        ],
      },
    ];
  }
});