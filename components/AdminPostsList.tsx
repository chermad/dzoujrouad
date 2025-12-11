'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Importez les fonctions nécessaires directement depuis votre fichier lib/firestore.js
import { Post, getAllPosts, deletePost } from '@/lib/firestore'; 

export default function AdminPostsList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fonction pour charger les données (utile pour le rechargement après suppression)
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // L'appel à getAllPosts() récupère tous les articles
            const fetchedPosts = await getAllPosts(); 
            // Tri pour s'assurer que les articles sont affichés par date de création, 
            // bien que getAllPosts le fasse déjà dans l'implémentation fournie.
            setPosts(fetchedPosts.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
        } catch (err) {
            console.error("Échec du chargement des articles pour l'admin :", err);
            setError("Impossible de charger les articles du blog.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (postId: string, title: string) => {
        // Confirmation avant la suppression
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'article: "${title}" ? Cette action est irréversible.`)) {
            setDeletingId(postId);
            try {
                // Appel de la fonction deletePost implémentée
                await deletePost(postId);
                // Recharger la liste après la suppression réussie
                fetchPosts();
            } catch (err) {
                // Afficher l'erreur retournée par la fonction deletePost
                alert("Erreur lors de la suppression de l'article. Veuillez réessayer.");
                console.error(err);
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-400">Chargement des articles...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-400">Erreur : {error}</div>;
    }

    if (posts.length === 0) {
        return <div className="text-center py-10 text-gray-500">Aucun article trouvé.</div>;
    }

    return (
        <div className="overflow-x-auto shadow-2xl rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700 bg-slate-800">
                <thead className="bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Titre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                            Publié
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-700 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                <Link href={`/posts/${post.slug}`} className="hover:text-blue-400">
                                    {post.title}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    post.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {post.isPublished ? 'Oui' : 'Non'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {post.createdAt.toDate().toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                {/* Bouton de Modification - Route /admin/edit/[id] à créer */}
                                <Link href={`/admin/edit/${post.id}`} 
                                    className="text-indigo-400 hover:text-indigo-600 transition duration-150 font-bold"
                                >
                                    Modifier
                                </Link>

                                {/* Bouton de Suppression */}
                                <button
                                    onClick={() => handleDelete(post.id, post.title)}
                                    className="text-red-400 hover:text-red-600 transition duration-150 font-bold disabled:opacity-50"
                                    disabled={deletingId === post.id}
                                >
                                    {deletingId === post.id ? '...' : 'Supprimer'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}