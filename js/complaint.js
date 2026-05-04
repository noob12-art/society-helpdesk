import { app } from "../firebase/firebase-config.js";
import { getDatabase, ref, push, onValue } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const db = getDatabase(app);

window.submitComplaint = function(){
  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;

  push(ref(db,"complaints"),{
    title, desc, status:"Pending"
  });

  alert("Submitted");
}

const list = document.getElementById("list");

if(list){
  onValue(ref(db,"complaints"), snapshot=>{
    list.innerHTML="";
    let p=0,pr=0,r=0;

    snapshot.forEach(data=>{
      let c = data.val();

      let li=document.createElement("li");
      li.className="list-group-item";
      li.innerHTML = c.title + " - " + c.status;
      list.appendChild(li);

      if(c.status=="Pending") p++;
      else if(c.status=="In Progress") pr++;
      else r++;
    });

    document.getElementById("p").innerText=p;
    document.getElementById("pr").innerText=pr;
    document.getElementById("r").innerText=r;
  });
}