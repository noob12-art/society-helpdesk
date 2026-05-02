// js/admin.js

import { app } from "../firebase/firebase-config.js";

import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const db = getFirestore(app);

window.loadAllComplaints = async function () {
  const list = document.getElementById("adminList");

  const snapshot = await getDocs(collection(db, "complaints"));

  let html = "";

  snapshot.forEach((item) => {
    const data = item.data();

    html += `
      <p>
        ${data.title} - ${data.status}
        <button onclick="resolve('${item.id}')">Resolve</button>
      </p>
    `;
  });

  list.innerHTML = html;
};

window.resolve = async function (id) {
  const ref = doc(db, "complaints", id);

  await updateDoc(ref, {
    status: "Resolved"
  });

  loadAllComplaints();
};