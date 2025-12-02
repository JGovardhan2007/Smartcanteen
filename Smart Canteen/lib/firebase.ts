import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// @ts-ignore
import { initializeApp, getApps, getApp } from "firebase/app";

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// Integrated from your project settings
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBBVx2yohwHGdk4Q0GMUfzmHwP3qFcZiwk",
  authDomain: "smart-canteen-e8b9e.firebaseapp.com",
  projectId: "smart-canteen-e8b9e",
  storageBucket: "smart-canteen-e8b9e.firebasestorage.app",
  messagingSenderId: "953109252612",
  appId: "1:953109252612:web:18c8273418271ca10c0351",
  measurementId: "G-SWQD5NG51V"
};

// Helper to check if the user has configured the app
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};

// Initialize Firebase
// Check if apps are already initialized to avoid duplicate errors in dev
const app = (typeof getApps === 'function' && getApps().length > 0) ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized successfully");

export { auth, db };