
// services/firebase.ts
// FIX: Changed imports to use Firebase v8 compatibility layer, as the build environment appears to be configured for it instead of the v9 modular API.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/functions";

// Environment variable helper to support both Vite (import.meta.env) and Next.js (process.env)
const getEnvVar = (nextName: string, viteName: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[nextName]) {
    return process.env[nextName] as string;
  }
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[viteName]) {
      return metaEnv[viteName];
    }
  } catch (e) {}
  return fallback;
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY", "AIzaSyD8TtiBPhLbqNQ7wlMiyrdzjN2B3NuB6lM"),
  authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_AUTH_DOMAIN", "mobi-trash-store.firebaseapp.com"),
  projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID", "mobi-trash-store"),
  storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_STORAGE_BUCKET", "mobi-trash-store.appspot.com"),
  messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_MESSAGING_SENDER_ID", "864103694948"),
  appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID", "1:864103694948:web:c3cdf42663462153aad571"),
  measurementId: getEnvVar("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID", "VITE_FIREBASE_MEASUREMENT_ID", "G-YE8PXLHZ42")
};

// Initialize Firebase
// FIX: Use v8 style initialization. Check if app is already initialized to prevent errors during hot-reloading.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// Export services
// FIX: Export v8 style services.
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();

// Enable Offline Persistence
// This allows the app to show data (products, etc.) even when there is no internet connection.
db.enablePersistence().catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence failed: Browser not supported');
    }
});
