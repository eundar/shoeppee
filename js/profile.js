loadComponent("navbar", "navbar.html");
loadComponent("footer", "footer.html");

document.addEventListener("DOMContentLoaded", () => {
  const user = session.currentUser || { fullname: "Guest User", role: "buyer" };
  document.getElementById("profileName").textContent = user.fullname;
  document.getElementById("profileRole").textContent = user.role;
  if (user.role === "seller") {
    document.getElementById("extraInfo").innerHTML = `
      <p>Gov ID: ${user.govID || '-'}</p>
      <p>DTI#: ${user.dti || '-'}</p>
    `;
  }
});
