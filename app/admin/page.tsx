'use client';

import { useState, useEffect } from 'react';
import { Post, getAllPosts } from '@/lib/firestore';
import { deletePost, updatePost } from '@/lib/firestore-admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEdit, 
  FaTrash, 
  FaExternalLinkAlt, 
  FaSync, 
  FaSearch, 
  FaFilter,
  FaUsers
} from 'react-icons/fa';

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const router = useRouter();

  // Vérifier l'authentification et les permissions admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Vérifier si l'utilisateur est admin
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          if (idTokenResult.claims.role === 'admin') {
            setIsAdmin(true);
            loadPosts();
          } else {
            // Rediriger si non admin
            router.push('/');
          }
        } catch (error) {
          console.error('Erreur vérification admin:', error);
          router.push('/');
        }
      } else {
        // Rediriger si non connecté
        router.push('/');
      }
    });

    return unsubscribe;
  }, [router]);

  // Charger les articles
  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les articles
  useEffect(() => {
    let result = posts;

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) ||
        post.author.toLowerCase().includes(term) ||
        post.description.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      result = result.filter(post => 
        filterStatus === 'published' ? post.isPublished : !post.isPublished
      );
    }

    setFilteredPosts(result);
  }, [posts, searchTerm, filterStatus]);

  // Gestion de la suppression
  const handleDelete = async (postId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      try {
        const success = await deletePost(postId);
        if (success) {
          // Mettre à jour la liste localement
          setPosts(prev => prev.filter(post => post.id !== postId));
          alert('Article supprimé avec succès !');
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Basculer le statut (publié ↔ brouillon)
  const togglePublishStatus = async (postId: string, currentStatus: boolean) => {
    setUpdatingStatus(postId);
    try {
      const success = await updatePost(postId, { isPublished: !currentStatus });
      
      if (success) {
        // Mettre à jour l'état local
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, isPublished: !currentStatus }
            : post
        ));
        
        const newStatus = !currentStatus ? 'publié' : 'mis en brouillon';
        alert(`Article ${newStatus} avec succès !`);
      } else {
        alert('Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // AJOUT DE LA FONCTION MANQUANTE : Publier tous les brouillons
  const publishAllDrafts = async () => {
    if (window.confirm('Voulez-vous vraiment publier tous les brouillons ?')) {
      try {
        const drafts = posts.filter(p => !p.isPublished);
        let successCount = 0;
        
        for (const draft of drafts) {
          const success = await updatePost(draft.id, { isPublished: true });
          if (success) successCount++;
        }
        
        // Recharger les articles
        await loadPosts();
        alert(`${successCount} brouillon(s) publié(s) avec succès !`);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la publication des brouillons');
      }
    }
  };

  // Formater la date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      return timestamp.toDate().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Raccourcir le texte pour l'affichage
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Vérification des permissions</h2>
          <p className="text-gray-400">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Tableau de Bord Admin
                </span>
              </h1>
              <p className="text-gray-400">
                Gérez et modérez le contenu de votre blog
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Bouton pour gérer les utilisateurs */}
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="Gérer les utilisateurs et les rôles"
              >
                <FaUsers className="text-lg" />
                Gérer les utilisateurs
              </Link>
              
              <Link
                href="/admin/new"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span className="text-lg">+</span> Nouvel Article
              </Link>
              
              <button
                onClick={loadPosts}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                {loading ? 'Chargement...' : 'Actualiser'}
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-blue-500 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{posts.length}</div>
              <div className="text-gray-400 text-sm">Total articles</div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2"></div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-green-500 transition-all duration-300">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {posts.filter(p => p.isPublished).length}
              </div>
              <div className="text-gray-400 text-sm">Articles publiés</div>
              <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2"></div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-yellow-500 transition-all duration-300">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {posts.filter(p => !p.isPublished).length}
              </div>
              <div className="text-gray-400 text-sm">Brouillons</div>
              <div className="h-1 w-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-2"></div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-purple-500 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{filteredPosts.length}</div>
              <div className="text-gray-400 text-sm">Filtrés</div>
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>
            </div>
          </div>
        </header>

        {/* Barre de contrôle */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <FaFilter /> Tous
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${filterStatus === 'published' ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <FaEye /> Publiés
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${filterStatus === 'draft' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <FaEyeSlash /> Brouillons
              </button>
            </div>

            {/* Bouton publier tous les brouillons */}
            {posts.filter(p => !p.isPublished).length > 0 && (
              <button
                onClick={publishAllDrafts}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaSync /> Publier tous ({posts.filter(p => !p.isPublished).length})
              </button>
            )}
          </div>
        </div>

        {/* Tableau des articles */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-white mb-2">Chargement des articles</h3>
              <p className="text-gray-400">Veuillez patienter...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun article trouvé</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par créer votre premier article'}
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Article</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Auteur</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr 
                      key={post.id} 
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-all duration-150 group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          {post.imageUrl && (
                            <div className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-600 group-hover:border-blue-500 transition-all duration-200">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 24 24" fill="%23374151"><rect width="24" height="24" rx="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="8" fill="%236b7280">Image</text></svg>';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                              {truncateText(post.title, 50)}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {truncateText(post.description, 80)}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags?.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-0.5 text-xs bg-slate-700 rounded-full hover:bg-slate-600 transition-colors duration-200"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags && post.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-300">{post.author}</div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => togglePublishStatus(post.id, post.isPublished)}
                          disabled={updatingStatus === post.id}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${post.isPublished 
                            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-400 hover:from-green-800/40 hover:to-emerald-800/40' 
                            : 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 text-yellow-400 hover:from-yellow-800/40 hover:to-orange-800/40'
                          } ${updatingStatus === post.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                          {updatingStatus === post.id ? (
                            <FaSync className="animate-spin" />
                          ) : post.isPublished ? (
                            <FaEye />
                          ) : (
                            <FaEyeSlash />
                          )}
                          {updatingStatus === post.id ? '...' : post.isPublished ? 'Publié' : 'Brouillon'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-400 text-sm">
                          {formatDate(post.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {/* Bouton Modifier */}
                          <Link
                            href={`/admin/edit/${post.id}`}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
                            title="Modifier"
                          >
                            <FaEdit /> Modifier
                          </Link>
                          
                          {/* Bouton Voir */}
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
                            title="Voir en ligne"
                          >
                            <FaExternalLinkAlt /> Voir
                          </Link>
                          
                          {/* Bouton Supprimer */}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105"
                            title="Supprimer"
                          >
                            <FaTrash /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Connecté en tant que <span className="text-blue-400">{user?.email}</span></p>
          <p className="mt-1">
            {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} affiché{filteredPosts.length > 1 ? 's' : ''}
            {filterStatus !== 'all' && ` (filtré${filterStatus === 'published' ? ' publiés' : ' brouillons'})`}
          </p>
        </div>
      </div>
    </div>
  );
}