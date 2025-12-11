// Script pour nettoyer le cache Firebase Auth local (IndexedDB)
const { indexedDB } = require("fake-indexeddb");

// Firebase utilise la base IndexedDB suivante :
indexedDB.deleteDatabase("firebaseLocalStorageDb");

console.log("🔥 Firebase Auth local reset !");
