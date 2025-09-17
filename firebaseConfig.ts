import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjUPXoCmW6DbjB2697j6CC8wcBpctP-NU",
  authDomain: "isd-2025.firebaseapp.com",
  projectId: "isd-2025",
  storageBucket: "isd-2025.firebasestorage.app",
  messagingSenderId: "559081729524",
  appId: "1:559081729524:web:3e1cab29454ce9093c5da1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore database

export { auth, db };