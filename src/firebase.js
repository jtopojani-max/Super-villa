import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

const missingConfig = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase config values: ${missingConfig.join(", ")}. ` +
      "Create/update your .env file before running the app."
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
// Persist auth sessions in the browser so refresh/reopen keeps the user signed in.
const authPersistenceReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to configure Firebase Auth persistence:", error);
});

let analytics = null;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch((error) => {
      console.warn("Firebase Analytics is not available in this environment.", error);
    });
}

export { app, auth, db, storage, functions, analytics, authPersistenceReady };
