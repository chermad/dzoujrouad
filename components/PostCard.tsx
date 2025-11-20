import Image from 'next/image';
import Link from 'next/link';
// Importez l'interface Post du fichier d'origine qui est TypeScript
import { Post } from '@/lib/firestore'; 

interface PostCardProps {
    post: Post;
}

/**
 * Composant pour afficher un résumé d'article sous forme de carte.
 * Il présente l'image à gauche et les métadonnées/description à droite.
 */
export default function PostCard({ post }: PostCardProps) {
    const displayDate = post.createdAt.toDate().toLocaleDateString('fr-FR');
    const postUrl = `/posts/${post.slug}`;

    // Fonction pour tronquer la description à un nombre de caractères (ex: 200)
    const truncateDescription = (text: string, limit: number) => {
        if (!text || text.length <= limit) {
            return text;
        }
        // Trouve le dernier espace avant la limite
        const trimmedText = text.substring(0, limit);
        return trimmedText.substring(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(' '))) + '...';
    };

    const shortDescription = truncateDescription(post.description, 200);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-slate-700">
            {/* Le lien englobe toute la zone cliquable */}
            <Link href={postUrl} className="flex flex-col md:flex-row h-full">
                
                {/* Conteneur pour l'Image et les Métadonnées (gauche/haut) */}
                <div className="relative w-full md:w-1/3 bg-slate-900 overflow-hidden flex flex-col">
                    {/* Image principale */}
                    <div className="relative w-full h-48 md:h-full">
                        {post.imageUrl ? (
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="transition-transform duration-500 hover:scale-110"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                                Pas d'image
                            </div>
                        )}
                    </div>
                    
                    {/* Auteur et Date (EN DESSOUS de l'image sur Mobile/Tablet, ou dans la colonne de gauche) */}
                    <div className="p-3 bg-slate-900 border-t border-slate-700 text-xs text-gray-400">
                        <p className="font-semibold text-white">Par : {post.author}</p>
                        <p>Publié le : {displayDate}</p>
                    </div>
                </div>

                {/* Contenu (Titre et Description Tronquée) (droite/bas) */}
                <div className="p-4 md:w-2/3 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight hover:text-indigo-400 transition">
                            {post.title}
                        </h2>
                        
                        {/* Description Tronquée */}
                        <p className="text-gray-300 text-base mt-2">
                            {shortDescription}
                        </p>
                    </div>

                    {/* Lien "Lire la suite" */}
                    <div className="mt-4">
                        <span className="inline-block px-4 py-2 text-indigo-400 border border-indigo-400 font-semibold rounded-lg hover:bg-indigo-400 hover:text-white transition duration-300">
                            Lire la suite →
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}