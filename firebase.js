// firebase.js – ES Module

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 HIER DEINE EIGENE FIREBASE CONFIG EINTRAGEN
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "DEIN_PROJECT",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.streetleFirebase = {
  db,
  ref,
  set,
  onValue,
  update
};
