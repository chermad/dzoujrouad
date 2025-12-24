// test-admin-simple-alternative.js
const path = require('path');
const fs = require('fs');

console.log('🚀 Test Firebase Admin avec fichier JSON...');

// Chemin vers le fichier JSON
const serviceAccountPath = path.join(__dirname, '..', 'config', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Fichier JSON non trouvé: ${serviceAccountPath}`);
  process.exit(1);
}

try {
  // Lire le fichier JSON
  const serviceAccount = require(serviceAccountPath);
  console.log('✅ Fichier JSON chargé:');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  console.log(`   Private Key ID: ${serviceAccount.private_key_id}`);
  console.log(`   Private Key (début): ${serviceAccount.private_key.substring(0, 30)}...`);
  
  // Initialiser Firebase Admin
  const admin = require('firebase-admin');
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialisé avec succès!');
    
    // Test de connexion
    console.log('\n📋 Test de connexion...');
    admin.auth().listUsers(100)
      .then((result) => {
        console.log(`✅ Connexion réussie! ${result.users.length} utilisateur(s)`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Erreur de connexion:', error.message);
        process.exit(1);
      });
  }
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}