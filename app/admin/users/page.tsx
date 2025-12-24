'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaUser, 
  FaUserShield, 
  FaUserTimes, 
  FaUserCheck, 
  FaArrowLeft,
  FaSearch,
  FaEnvelope,
  FaCalendarAlt,
  FaCrown
} from 'react-icons/fa';

// Service pour gérer les rôles (à créer)
import { 
  getAllUsers, 
  setUserAdminRole, 
  removeUserAdminRole,
  UserWithRole 
} from '@/lib/user-management';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.role === 'admin') {
            setIsAdmin(true);
            loadUsers();
          } else {
            router.push('/');
          }
        } catch (error) {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    });

    return unsubscribe;
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs
  useEffect(() => {
    let result = users;

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(term) ||
        user.displayName?.toLowerCase().includes(term) ||
        user.uid.includes(term)
      );
    }

    // Filtre par rôle
    if (filterRole !== 'all') {
      result = result.filter(user => 
        filterRole === 'admin' ? user.isAdmin : !user.isAdmin
      );
    }

    setFilteredUsers(result);
  }, [users, searchTerm, filterRole]);

  const handleMakeAdmin = async (userId: string, email: string) => {
    if (window.confirm(`Donner les droits administrateur à ${email} ?`)) {
      setUpdatingUser(userId);
      try {
        const success = await setUserAdminRole(userId);
        if (success) {
          await loadUsers();
          alert(`${email} est maintenant administrateur`);
        } else {
          alert('Erreur lors de la mise à jour');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const handleRemoveAdmin = async (userId: string, email: string) => {
    if (window.confirm(`Retirer les droits administrateur à ${email} ?`)) {
      setUpdatingUser(userId);
      try {
        const success = await removeUserAdminRole(userId);
        if (success) {
          await loadUsers();
          alert(`${email} n'est plus administrateur`);
        } else {
          alert('Erreur lors de la mise à jour');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la mise à jour');
      } finally {
        setUpdatingUser(null);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Vérification des permissions</h2>
          <p className="text-gray-400">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  title="Retour au tableau de bord"
                >
                  <FaArrowLeft className="text-xl" />
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                    Gestion des utilisateurs
                  </span>
                </h1>
              </div>
              <p className="text-gray-400">
                Gérez les rôles et permissions des utilisateurs
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadUsers}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaSearch className={loading ? 'animate-spin' : ''} />
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-white mb-1">{users.length}</div>
              <div className="text-gray-400 text-sm">Total utilisateurs</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {users.filter(u => u.isAdmin).length}
              </div>
              <div className="text-gray-400 text-sm">Administrateurs</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {users.filter(u => !u.isAdmin).length}
              </div>
              <div className="text-gray-400 text-sm">Utilisateurs standard</div>
            </div>
          </div>
        </header>

        {/* Barre de contrôle */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <div className="absolute inset-y -0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-lg ${filterRole === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterRole('admin')}
                className={`px-4 py-2 rounded-lg ${filterRole === 'admin' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <FaUserShield className="inline mr-2" /> Admins
              </button>
              <button
                onClick={() => setFilterRole('user')}
                className={`px-4 py-2 rounded-lg ${filterRole === 'user' ? 'bg-gradient-to-r from-cyan-600 to-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <FaUser className="inline mr-2" /> Utilisateurs
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Chargement des utilisateurs</h3>
              <p className="text-gray-400">Veuillez patienter...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-400">Modifiez vos critères de recherche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Utilisateur</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Date d'inscription</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Rôle</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.uid} 
                      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-150 ${
                        currentUser?.uid === user.uid ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.displayName || 'Non renseigné'}
                              {currentUser?.uid === user.uid && (
                                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">VOUS</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">UID: {user.uid.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <FaEnvelope className="text-gray-500" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <FaCalendarAlt className="text-gray-500" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                          user.isAdmin 
                            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 text-purple-400' 
                            : 'bg-gradient-to-r from-slate-700 to-slate-800 text-gray-400'
                        }`}>
                          {user.isAdmin ? <FaCrown /> : <FaUser />}
                          {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {user.isAdmin ? (
                            <button
                              onClick={() => handleRemoveAdmin(user.uid, user.email || '')}
                              disabled={updatingUser === user.uid || currentUser?.uid === user.uid}
                              className={`px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                                currentUser?.uid === user.uid ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                              }`}
                              title={currentUser?.uid === user.uid ? "Vous ne pouvez pas vous retirer vos propres droits" : "Retirer les droits admin"}
                            >
                              {updatingUser === user.uid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FaUserTimes />
                              )}
                              Retirer Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeAdmin(user.uid, user.email || '')}
                              disabled={updatingUser === user.uid}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
                              title="Donner les droits administrateur"
                            >
                              {updatingUser === user.uid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FaUserCheck />
                              )}
                              Rendre Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaUserShield /> Guide des permissions
          </h3>
          <ul className="text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span><strong>Administrateurs</strong> peuvent gérer les articles et les utilisateurs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong>Utilisateurs standards</strong> peuvent seulement lire les articles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">⚠</span>
              <span>Un administrateur ne peut pas se retirer ses propres droits (sécurité)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">ℹ</span>
              <span>Les modifications de rôle peuvent prendre quelques minutes pour être effectives</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}