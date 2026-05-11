import { getCurrentUser, loginUser, logoutCurrentUser, registerResident } from "../firebase/firebase-config.js";

function showMessage(targetId, type, message) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = `<div class="alert alert-${type} mb-0">${message}</div>`;
}

function redirectIfNeeded() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const user = getCurrentUser();

  if (currentPage === "dashboard.html" && !user) {
    window.location.href = "login.html";
  }

  if (currentPage === "admin.html" && (!user || user.role !== "admin")) {
    window.location.href = "login.html";
  }
}

function bindSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const flatNumber = document.getElementById("flatNumber").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMessage("signupMessage", "danger", "Passwords do not match.");
      return;
    }

    try {
      await registerResident({ fullName, flatNumber, phoneNumber, email, password });
      showMessage("signupMessage", "success", "Account created successfully. Redirecting...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (error) {
      showMessage("signupMessage", "danger", error.message);
    }
  });
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const role = document.getElementById("loginRole").value;

    try {
      const user = await loginUser({ email, password, role });
      showMessage("loginMessage", "success", "Login successful. Redirecting...");
      setTimeout(() => {
        window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
      }, 900);
    } catch (error) {
      showMessage("loginMessage", "danger", error.message);
    }
  });
}

function bindLogoutButton() {
  const button = document.getElementById("logoutButton");
  if (!button) return;

  button.addEventListener("click", async () => {
    await logoutCurrentUser();
    window.location.href = "login.html";
  });
}
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const role = document.getElementById("loginRole").value;
    const loginMessage = document.getElementById("loginMessage");

    // Email validation pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Clear previous messages
    loginMessage.innerHTML = "";

    // Email validation
    if (!emailPattern.test(email)) {
      loginMessage.innerHTML = `
        <div class="alert alert-danger">
          Please enter a valid email address.
        </div>
      `;
      return;
    }

    // Password validation
    if (password.length < 6) {
      loginMessage.innerHTML = `
        <div class="alert alert-danger">
          Password must be at least 6 characters long.
        </div>
      `;
      return;
    }

    // Role validation
    if (role !== "resident" && role !== "admin") {
      loginMessage.innerHTML = `
        <div class="alert alert-danger">
          Please select a valid role.
        </div>
      `;
      return;
    }

    // Demo admin check
    if (role === "admin" && !email.includes("admin")) {
      loginMessage.innerHTML = `
        <div class="alert alert-danger">
          Admin email must contain the word "admin".
        </div>
      `;
      return;
    }

    // Success message
    loginMessage.innerHTML = `
      <div class="alert alert-success">
        Login validation successful!
      </div>
    `;

    console.log("Login successful");

    // Firebase login code goes here
  });
}
redirectIfNeeded();
bindSignupForm();
bindLoginForm();
bindLogoutButton();