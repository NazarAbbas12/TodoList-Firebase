// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
  
import { getFirestore, collection,serverTimestamp, getDocs, addDoc,deleteDoc, doc,updateDoc } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBOPEIUk4bCEqU9abv2heAx1zRax7_dwXk",
    authDomain: "todo-list-ad5be.firebaseapp.com",
    projectId: "todo-list-ad5be",
    storageBucket: "todo-list-ad5be.firebasestorage.app",
    messagingSenderId: "1027513106987",
    appId: "1:1027513106987:web:435bbcf9e78a3c9a34e06e"
};

  // Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { collection,serverTimestamp, getDocs, db, addDoc, deleteDoc, doc,updateDoc }
