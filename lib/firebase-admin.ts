import * as admin from 'firebase-admin';

/**
 * Initialisation UNIQUE de Firebase Admin SDK
 * ⚠️ Doit TOUJOURS utiliser le vrai projet Firebase
 * (jamais de projet fictif, même en développement)
 */

function initializeFirebaseAdmin() {
  // Évite toute double initialisation
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    // Vérification des variables d’environnement obligatoires
    const requiredEnvVars = [
      'FIREBASE_ADMIN_PROJECT_ID',
      'FIREBASE_ADMIN_CLIENT_EMAIL',
      'FIREBASE_ADMIN_PRIVATE_KEY',
    ];

    const missingVars = requiredEnvVars.filter(
      (key) => !process.env[key]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Variables d’environnement Firebase Admin manquantes : ${missingVars.join(', ')}`
      );
    }

    // Création des credentials Firebase Admin
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Initialisation Firebase Admin
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialisé avec succès');
    console.log('📌 Project ID :', serviceAccount.projectId);

    return app;
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE : Firebase Admin SDK non initialisé');
    console.error(error);
    throw error; // ❗ On échoue volontairement si Admin est mal configuré
  }
}

// Initialisation réelle
const firebaseAdminApp = initializeFirebaseAdmin();

// Exports propres
export const adminAuth = admin.auth(firebaseAdminApp);
export const adminFirestore = admin.firestore(firebaseAdminApp);
export { admin };
