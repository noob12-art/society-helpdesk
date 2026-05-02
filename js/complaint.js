import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { app } from "../firebase/firebase-config.js";

const db = getDatabase(app);

// SUBMIT COMPLAINT
window.submitComplaint = function () {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  const newRef = push(ref(db, "complaints"));

  set(newRef, {
    title: title,
    description: description,
    status: "Pending"
  });

  alert("Complaint submitted");
};

// LOAD COMPLAINTS
window.loadComplaints = function () {
  const list = document.getElementById("complaintsList");

  const dbRef = ref(db, "complaints");

  onValue(dbRef, (snapshot) => {
    let html = "";

    snapshot.forEach((child) => {
      const data = child.val();
      html += `<p>${data.title} - ${data.status}</p>`;
    });

    list.innerHTML = html;
  });
};