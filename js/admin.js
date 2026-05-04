// js/admin.js

import { app } from "../firebase/firebase-config.js";
import { getDatabase, ref, onValue, update } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const db = getDatabase(app);
const list = document.getElementById("adminList");

onValue(ref(db,"complaints"), snapshot=>{
  list.innerHTML="";

  snapshot.forEach(data=>{
    let c = data.val();
    let key = data.key;

    let li=document.createElement("li");
    li.className="list-group-item";

    li.innerHTML = `
      ${c.title} - ${c.status}
      <button onclick="change('${key}','In Progress')" class="btn btn-warning btn-sm">Progress</button>
      <button onclick="change('${key}','Resolved')" class="btn btn-success btn-sm">Resolve</button>
    `;

    list.appendChild(li);
  });
});

window.change = function(id,status){
  update(ref(db,"complaints/"+id),{status});
}