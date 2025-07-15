
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCovHy5DkJOK1NEfG8sNELIXPEKvBDjI14",
  authDomain: "eventos-tecnolog.firebaseapp.com",
  projectId: "eventos-tecnolog",
  storageBucket: "eventos-tecnolog.firebasestorage.app",
  messagingSenderId: "169293941983",
  appId: "1:169293941983:web:2b2fcd0697b2ef7137ad6a",
  measurementId: "G-BJDN39SS7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
