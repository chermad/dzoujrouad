// lib/firebase.js

import { initializeApp } from "firebase/app";
// Importation du service Firestore et du type Timestamp
import { getFirestore, Timestamp } from "firebase/firestore";

// Configuration Firebase chargée depuis .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialisation du service Firestore
const db = getFirestore(app);

// Exportation des services pour les autres modules
export { db, Timestamp };