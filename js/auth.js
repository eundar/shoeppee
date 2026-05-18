const users = [
  {
    fullname: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    password: "password123",
    role: "buyer"
  },
  {
    fullname: "Jane Smith",
    email: "jane.smith@example.com",
    username: "janesmith",
    password: "password456",
    role: "seller"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const sellerFields = document.getElementById("sellerFields");

  if (roleSelect) {
    roleSelect.addEventListener("change", () => {
      sellerFields.style.display = roleSelect.value === "seller" ? "block" : "none";
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      const user = {
        fullname: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        govID: document.getElementById("govID")?.value || "",
        dti: document.getElementById("dtiNumber")?.value || ""
      };
      users.push(user);
      showToast("Registration successful! Please log in.");
      window.location.href = "login.html";
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;
      const role = document.getElementById("loginRole").value;
      const existing = users.find(u => (u.username === username || u.email === username) && u.password === password && u.role === role);

      if (existing) {
        session.currentUser = existing;
        if (role === "buyer") window.location.href = "buyer-dashboard.html";
        else window.location.href = "seller-dashboard.html";
      } else {
        showToast("Invalid login credentials.");
      }
    });
  }
});
