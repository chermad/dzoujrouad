import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Pour utiliser Firebase Admin SDK, vous devez d'abord l'installer
// npm install firebase-admin

export async function POST(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = await params;
    const { role } = await request.json();

    // Vérifier que l'utilisateur est authentifié
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Non autorisé. Token manquant.' 
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Note: Pour une vraie implémentation, vous devez :
    // 1. Installer Firebase Admin SDK
    // 2. Créer un fichier firebase-admin.ts
    // 3. Vérifier le token et les permissions
    
    console.log(`Changement de rôle demandé:
      - Utilisateur cible: ${uid}
      - Nouveau rôle: ${role}
      - Token: ${token.substring(0, 20)}...
    `);

    // Pour le développement, simuler une réponse réussie
    // Dans la production, vous utiliseriez:
    // const adminAuth = getAuth(adminApp);
    // await adminAuth.setCustomUserClaims(uid, { role: role });
    
    return NextResponse.json({ 
      success: true, 
      message: `Rôle ${role} attribué à l'utilisateur ${uid} (simulation)`,
      data: {
        uid,
        role,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Optionnel: GET pour récupérer le rôle d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = await params;
    
    // Simuler la récupération du rôle
    // Dans la production: const user = await adminAuth.getUser(uid);
    
    return NextResponse.json({
      uid,
      role: 'user', // Par défaut
      isAdmin: false
    });
    
  } catch (error) {
    console.error('Erreur API GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}