import {
  logoutCurrentUser,
  registerResident
} from "../firebase/firebase-config.js";

function showMessage(targetId, type, message) {
  const target = document.getElementById(targetId);

  if (!target) return;

  target.innerHTML = `
    <div class="alert alert-${type} mb-0">
      ${message}
    </div>
  `;
}

function redirectIfNeeded() {

  const currentPage =
    window.location.pathname.split("/").pop();
  const user =
    JSON.parse(localStorage.getItem("user"));

  // Protect dashboard
  if (
    currentPage === "dashboard.html" &&
    !user
  ) {

    window.location.href = "login.html";
  }

  // Protect admin page
  if (
    currentPage === "admin.html" &&
    (!user || user.role !== "admin")
  ) {

    window.location.href = "login.html";
  }
}

function bindSignupForm() {

  const form = document.getElementById("signupForm");

  if (!form) return;

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName =
      document.getElementById("fullName").value.trim();

    const flatNumber =
      document.getElementById("flatNumber").value.trim();

    const phoneNumber =
      document.getElementById("phoneNumber").value.trim();

    const email =
      document.getElementById("signupEmail").value.trim();

    const password =
      document.getElementById("signupPassword").value;

    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

      showMessage(
        "signupMessage",
        "danger",
        "Passwords do not match."
      );

      return;
    }

    try {

      await registerResident({
        fullName,
        flatNumber,
        phoneNumber,
        email,
        password
      });

      showMessage(
        "signupMessage",
        "success",
        "Account created successfully."
      );

      setTimeout(() => {
        window.location.href = "raise.html";
      }, 1000);

    } catch (error) {

      showMessage(
        "signupMessage",
        "danger",
        error.message
      );
    }
  });
}

function bindLoginForm() {

  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {

    event.preventDefault();

    const email =
      document.getElementById("loginEmail").value.trim();

    const password =
      document.getElementById("loginPassword").value.trim();

    if (!email || !password) {

      showMessage(
        "loginMessage",
        "danger",
        "Please fill all fields."
      );

      return;
    }

    showMessage(
      "loginMessage",
      "success",
      "Login successful. Redirecting..."
    );

    setTimeout(() => {

      // ADMIN LOGIN
      if (email === "admin@gmail.com") {

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email,
            role: "admin"
          })
        );

        window.location.href = "admin.html";

      }

      // RESIDENT LOGIN
      else {

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email,
            role: "resident"
          })
        );

        window.location.href = "dashboard.html";
      }

    }, 800);

  });
}

function bindLogoutButton() {

  const button =
    document.getElementById("logoutButton");

  if (!button) return;

  button.addEventListener("click", async () => {

    localStorage.removeItem("user");

    await logoutCurrentUser();

    window.location.href = "login.html";
  });
}

redirectIfNeeded();
bindSignupForm();
bindLoginForm();
bindLogoutButton();