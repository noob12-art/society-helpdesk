
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-7BcS-OWkKKtlffxFbxLz9mKwqOzcgOg",
  authDomain: "society-helpdesk-9b874.firebaseapp.com",
  projectId: "society-helpdesk-9b874",
  storageBucket: "society-helpdesk-9b874.firebasestorage.app",
  messagingSenderId: "210358422355",
  appId: "1:210358422355:web:a452b84974ff9ba341efa6",
  databaseURL: "https://society-helpdesk-9b874-default-rtdb.asia-southeast1.firebasedatabase.app"
  }
const app = initializeApp(firebaseConfig);

export { app };