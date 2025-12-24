import { auth } from './firebase';

/**
 * Structure utilisée par l’UI /admin/users
 */
export interface UserWithRole {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

/**
 * Récupère le token Firebase de l’utilisateur courant
 */
async function getIdToken(): Promise<string> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Utilisateur non authentifié');
  }

  return await currentUser.getIdToken();
}

/**
 * 🔹 GET — Récupérer tous les utilisateurs Firebase (réels)
 */
export async function getAllUsers(): Promise<UserWithRole[]> {
  try {
    const token = await getIdToken();

    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API error response:', text);
      throw new Error('Erreur API /api/admin/users');
    }


    return await response.json();
  } catch (error) {
    console.error('getAllUsers error:', error);
    return [];
  }
}

/**
 * 🔹 POST — Donner le rôle ADMIN à un utilisateur
 */
export async function setUserAdminRole(uid: string): Promise<boolean> {
  try {
    const token = await getIdToken();

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid,
        makeAdmin: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Impossible de donner le rôle admin');
    }

    return true;
  } catch (error) {
    console.error('setUserAdminRole error:', error);
    alert('Erreur lors de l’attribution du rôle admin');
    return false;
  }
}

/**
 * 🔹 POST — Retirer le rôle ADMIN à un utilisateur
 */
export async function removeUserAdminRole(uid: string): Promise<boolean> {
  try {
    const token = await getIdToken();

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid,
        makeAdmin: false,
      }),
    });

    if (!response.ok) {
  const error = await response.json();

  // Cas spécifique : super admin protégé
  if (error.error === 'Action interdite : le super administrateur est protégé') {
    alert(
      '⛔ Ce compte est un super administrateur.\n' +
      'Ses droits ne peuvent pas être retirés.'
    );
    return false;
  }

  throw new Error(error.error || 'Impossible de retirer le rôle admin');
}


    return true;
  } catch (error) {
    console.error('removeUserAdminRole error:', error);
    alert('Erreur lors du retrait du rôle admin');
    return false;
  }
}

/**
 * 🔹 (Optionnel) Récupérer un utilisateur par UID
 */
export async function getUserById(uid: string): Promise<UserWithRole | null> {
  try {
    const users = await getAllUsers();
    return users.find(user => user.uid === uid) || null;
  } catch {
    return null;
  }
}

/**
 * 🔹 (Optionnel) Recherche locale (déjà utilisée par l’UI)
 */
export async function searchUsers(query: string): Promise<UserWithRole[]> {
  const users = await getAllUsers();
  const q = query.toLowerCase();

  return users.filter(user =>
    user.email?.toLowerCase().includes(q) ||
    user.displayName?.toLowerCase().includes(q) ||
    user.uid.toLowerCase().includes(q)
  );
}
