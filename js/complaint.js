import {
  createComplaint,
  getComplaintsForCurrentUser,
  getCurrentUser,
} from "../firebase/firebase-config.js";

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "In Progress") return "status-progress";
  return "status-received";
}

function renderComplaintTable(complaints) {
  const tableWrap = document.getElementById("dashboardTableWrap");
  if (!tableWrap) return;

  if (!complaints.length) {
    tableWrap.innerHTML = `
      <div class="empty-state">
        <h3 class="h5">No complaints found</h3>
        <p class="mb-3">You have not submitted any complaints yet.</p>
        <a href="raise.html" class="btn btn-primary">Raise your first complaint</a>
      </div>
    `;
    return;
  }

  tableWrap.innerHTML = `
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>Complaint ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Remarks</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${complaints
          .map(
            (complaint) => `
          <tr>
            <td>${complaint.complaintId}</td>
            <td>
              <strong>${complaint.title}</strong>
              <div class="small-muted">${complaint.location || "Location not specified"}</div>
            </td>
            <td>${complaint.category}</td>
            <td>${complaint.priority}</td>
            <td><span class="status-badge ${getStatusClass(complaint.status)}">${complaint.status}</span></td>
            <td>${complaint.remarks || "-"}</td>
            <td>${new Date(complaint.createdAt).toLocaleDateString()}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function bindComplaintForm() {
  const form = document.getElementById("complaintForm");
  if (!form) return;

  const currentUser = getCurrentUser();
  if (currentUser) {
    const nameField = document.getElementById("complaintName");
    const emailField = document.getElementById("complaintEmail");
    const flatField = document.getElementById("flatNo");
    if (nameField) nameField.value = currentUser.fullName || "";
    if (emailField) emailField.value = currentUser.email || "";
    if (flatField) flatField.value = currentUser.flatNumber || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById("complaintName").value.trim(),
      email: document.getElementById("complaintEmail").value.trim(),
      flatNumber: document.getElementById("flatNo").value.trim(),
      category: document.getElementById("complaintCategory").value,
      priority: document.getElementById("complaintPriority").value,
      location: document.getElementById("complaintLocation").value.trim(),
      title: document.getElementById("complaintTitle").value.trim(),
      description: document.getElementById("complaintDescription").value.trim(),
    };

    const messageBox = document.getElementById("complaintMessage");

    try {
      const complaint = await createComplaint(payload);
      messageBox.innerHTML = `
        <div class="alert alert-success mb-0">
          Complaint submitted successfully. Your complaint ID is <strong>${complaint.complaintId}</strong>.
        </div>
      `;
      form.reset();
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } catch (error) {
      messageBox.innerHTML = `<div class="alert alert-danger mb-0">${error.message}</div>`;
    }
  });
}

async function loadResidentDashboard() {
  const tableWrap = document.getElementById("dashboardTableWrap");
  if (!tableWrap) return;

  const searchInput = document.getElementById("dashboardSearch");
  let complaints = await getComplaintsForCurrentUser();

  const renderStats = (items) => {
    document.getElementById("totalCount").textContent = items.length;
    document.getElementById("receivedCount").textContent = items.filter((item) => item.status === "Received").length;
    document.getElementById("progressCount").textContent = items.filter((item) => item.status === "In Progress").length;
    document.getElementById("resolvedCount").textContent = items.filter((item) => item.status === "Resolved").length;
  };

  const applyFilter = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = complaints.filter((item) =>
      [item.complaintId, item.title, item.category].join(" ").toLowerCase().includes(query)
    );
    renderStats(filtered);
    renderComplaintTable(filtered);
  };

  renderStats(complaints);
  renderComplaintTable(complaints);

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }
}

bindComplaintForm();
loadResidentDashboard();