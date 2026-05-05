import { getAllComplaints, updateComplaint } from "../firebase/firebase-config.js";

function getStatusClass(status) {
  if (status === "Resolved") return "status-resolved";
  if (status === "In Progress") return "status-progress";
  return "status-received";
}

function renderStats(complaints) {
  document.getElementById("adminTotalCount").textContent = complaints.length;
  document.getElementById("adminReceivedCount").textContent = complaints.filter(
    (item) => item.status === "Received"
  ).length;
  document.getElementById("adminProgressCount").textContent = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;
  document.getElementById("adminResolvedCount").textContent = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;
}

function adminRow(complaint) {
  return `
    <tr>
      <td>${complaint.complaintId}</td>
      <td>
        <strong>${complaint.title}</strong>
        <div class="small-muted">${complaint.name} | Flat ${complaint.flatNumber}</div>
      </td>
      <td>${complaint.category}</td>
      <td>${complaint.priority}</td>
      <td><span class="status-badge ${getStatusClass(complaint.status)}">${complaint.status}</span></td>
      <td style="min-width: 180px;">
        <select class="form-select form-select-sm status-select" data-id="${complaint.id}">
          <option value="Received" ${complaint.status === "Received" ? "selected" : ""}>Received</option>
          <option value="In Progress" ${complaint.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Resolved" ${complaint.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </td>
      <td style="min-width: 220px;">
        <input
          type="text"
          class="form-control form-control-sm remark-input"
          data-id="${complaint.id}"
          value="${complaint.remarks || ""}"
          placeholder="Add admin remark"
        />
      </td>
      <td>
        <button class="btn btn-sm btn-success save-update-btn" data-id="${complaint.id}">Save</button>
      </td>
    </tr>
  `;
}

function renderTable(complaints) {
  const tableWrap = document.getElementById("adminTableWrap");
  if (!tableWrap) return;

  if (!complaints.length) {
    tableWrap.innerHTML = `
      <div class="empty-state">
        <h3 class="h5">No complaints available</h3>
        <p class="mb-0">Complaints submitted by residents will appear here.</p>
      </div>
    `;
    return;
  }

  tableWrap.innerHTML = `
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>Complaint ID</th>
          <th>Resident</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Current Status</th>
          <th>Change Status</th>
          <th>Remark</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${complaints.map(adminRow).join("")}</tbody>
    </table>
  `;
}

async function loadAdminPanel() {
  const tableWrap = document.getElementById("adminTableWrap");
  if (!tableWrap) return;

  const searchInput = document.getElementById("adminSearch");
  let complaints = await getAllComplaints();

  const applyFilter = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = complaints.filter((item) =>
      [item.complaintId, item.title, item.category, item.name].join(" ").toLowerCase().includes(query)
    );
    renderStats(filtered);
    renderTable(filtered);
    bindSaveButtons();
  };

  renderStats(complaints);
  renderTable(complaints);
  bindSaveButtons();

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }
}

function bindSaveButtons() {
  document.querySelectorAll(".save-update-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;
      const status = document.querySelector(`.status-select[data-id="${id}"]`)?.value;
      const remarks = document.querySelector(`.remark-input[data-id="${id}"]`)?.value.trim();

      button.disabled = true;
      button.textContent = "Saving...";

      try {
        await updateComplaint(id, { status, remarks });
        button.textContent = "Saved";
        setTimeout(() => window.location.reload(), 600);
      } catch (error) {
        button.disabled = false;
        button.textContent = "Save";
        alert(error.message);
      }
    });
  });
}

loadAdminPanel();