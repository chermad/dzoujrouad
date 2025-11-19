// app/posts/[slug]/page.tsx

import { getPostBySlug } from '@/lib/firestore'; // Import de la nouvelle fonction
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation'; // Pour gérer le cas où l'article n'existe pas

// Définition du type pour les props (paramètres de la route)
interface PostPageProps {
  params: {
    slug: string; // Le slug de l'article (ex: mon-super-article)
  };
}

// Ce composant est un Server Component asynchrone pour la récupération des données.
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = params;

  // 1. Récupération des données
  const post = await getPostBySlug(slug);

  // 2. Gestion des erreurs (Article non trouvé)
  if (!post) {
    // notFound() déclenche la page 404 de Next.js
    notFound(); 
  }

  // 3. Formatage de la date (pour l'affichage)
  const dateStr = post.createdAt?.toDate().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) || 'Date inconnue';


  return (
    <div className="max-w-4xl mx-auto p-8 pt-12">
      
      {/* Bouton de retour */}
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:text-blue-300 font-medium transition duration-300">
          ← Retour à l'accueil
        </Link>
      </div>

      <article className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
        
        {/* IMAGE D'EN-TÊTE (Style "cover" pour l'esthétisme) */}
        {post.imageUrl && (
            <div className="mb-6 overflow-hidden rounded-lg"> 
                {/* Hauteur fixe (400px) pour l'en-tête, pleine largeur */}
                <div className="relative h-[400px] w-full"> 
                    <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover object-center" // Couvre l'espace, rognage possible
                    sizes="(max-width: 1024px) 100vw, 900px"
                    priority 
                    />
                </div>
            </div>
        )}

        {/* Titre */}
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          {post.title}
        </h1>
        
        {/* Méta-informations */}
        <p className="text-sm text-gray-400 mb-8 border-b border-slate-700 pb-4">
          Publié le {dateStr} par <span className="text-blue-400">{post.author}</span>.
        </p>

        {/* Contenu COMPLET */}
        {/* prose-invert stylise le texte (paragraphes, listes, etc.) pour un fond sombre */}
        <div className="prose prose-lg prose-invert text-gray-300">
          {/* Affiche le contenu complet de l'article (champ 'content') */}
          <p>{post.content}</p> 
          
          {/* Affichage des tags (optionnel) */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-700">
              <span className="font-semibold mr-2">Tags:</span>
              {post.tags.map(tag => (
                <span key={tag} className="inline-block bg-blue-900/50 text-blue-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

      </article>
      
      {/* Bouton de retour */}
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:text-blue-300 font-medium transition duration-300">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}