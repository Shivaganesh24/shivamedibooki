// src/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Use environment variables (safe for Vercel and local builds)
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBpgMjhkDcbtWFPSUcB4-1NKiboy4q75Zg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medibookii-89000255-51f17.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medibookii-89000255-51f17",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medibookii-89000255-51f17.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "301855661161",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:301855661161:web:fd81c09216b94352a416f8",
};

// ✅ Initialize Firebase safely (avoids app/no-options)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
