import { app } from "../firebase/firebase-config.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const auth = getAuth(app);

window.signup = function(){
  let email=document.getElementById("email").value;
  let pass=document.getElementById("pass").value;

  createUserWithEmailAndPassword(auth,email,pass)
  .then(()=>alert("Signup success"));
}

window.login = function(){
  let email=document.getElementById("email").value;
  let pass=document.getElementById("pass").value;

  signInWithEmailAndPassword(auth,email,pass)
  .then(()=>location.href="index.html");
}