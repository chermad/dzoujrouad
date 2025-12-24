import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * UID du super administrateur (chermad)
 * ⚠️ Ce compte est PROTÉGÉ et ne peut jamais perdre son rôle admin
 */
const SUPER_ADMIN_UID = 'WvFyq3LOSKgx8KJSMUqAXA8EENQ2';

/**
 * Vérifie que la requête provient d'un utilisateur ADMIN
 * - Lit le token Bearer
 * - Vérifie le custom claim "role"
 */
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token manquant ou invalide');
  }

  const token = authHeader.replace('Bearer ', '');
  const decodedToken = await adminAuth.verifyIdToken(token);

  if (decodedToken.role !== 'admin') {
    throw new Error('Accès refusé : droits administrateur requis');
  }

  return decodedToken;
}

/**
 * GET /api/admin/users
 * ➜ Liste tous les utilisateurs Firebase Auth (réels)
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const listResult = await adminAuth.listUsers(1000);

    const users = listResult.users.map(user => ({
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      isAdmin: user.customClaims?.role === 'admin',
      createdAt: user.metadata.creationTime ?? null,
      lastSignInAt: user.metadata.lastSignInTime ?? null,
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);

    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 401 }
    );
  }
}

/**
 * POST /api/admin/users
 * ➜ Ajoute ou retire le rôle ADMIN à un utilisateur
 *
 * Body attendu :
 * {
 *   "uid": "xxxxxxxx",
 *   "makeAdmin": true | false
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const { uid, makeAdmin } = body;

    if (!uid || typeof makeAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Payload invalide' },
        { status: 400 }
      );
    }

    // 🔐 Protection ABSOLUE du super admin (chermad)
    if (uid === SUPER_ADMIN_UID) {
      return NextResponse.json(
        { error: 'Action interdite : le super administrateur est protégé' },
        { status: 403 }
      );
    }

    if (makeAdmin) {
      await adminAuth.setCustomUserClaims(uid, { role: 'admin' });
    } else {
      await adminAuth.setCustomUserClaims(uid, { role: 'user' });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/admin/users error:', error);

    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 401 }
    );
  }
}
