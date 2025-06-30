// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYpjDFT753hC5gowLi9R3dQEzlP-RGhLE",
  authDomain: "quran-c052f.firebaseapp.com",
  projectId: "quran-c052f",
  storageBucket: "quran-c052f.firebasestorage.app",
  messagingSenderId: "580574739527",
  appId: "1:580574739527:web:321b67164693ef3667c562",
  measurementId: "G-4S8ZQD0BCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// تصدير الخدمات
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;