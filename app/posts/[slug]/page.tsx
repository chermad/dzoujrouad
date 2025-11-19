import { notFound } from 'next/navigation';
import Image from 'next/image'; 
import { getPostBySlug, Post } from '@/lib/firestore'; 

interface PostPageProps {
  // Les params sont définis ici
  params: {
    slug: string;
  };
}

/**
 * Composant de page dynamique pour afficher un article spécifique.
 * Le composant est 'async' pour pouvoir utiliser 'await'.
 */
export default async function PostPage({ params }: PostPageProps) {
    // CORRECTION CRITIQUE : Utilisation de 'await' pour s'assurer que les params
    // sont résolus correctement.
    const resolvedParams = await params;
    const slug = resolvedParams.slug;


  // VÉRIFICATION DE SÉCURITÉ : Assurer que le slug est défini
  if (!slug) {
    notFound(); 
  }
  
  // Utilisation de 'await' pour résoudre la Promise de la BDD.
  const post: Post | null = await getPostBySlug(slug); 

  // Si le post n'est pas trouvé
  if (!post) {
    notFound(); 
  }

  // Conversion du Timestamp (post.createdAt) en Date pour l'affichage.
  const displayDate = post.createdAt.toDate().toLocaleDateString('fr-FR');


  return (
    <div className="container mx-auto p-8 max-w-4xl bg-slate-800 shadow-2xl rounded-xl mt-10 text-white">
      <article className="space-y-6">
        <header className="border-b border-slate-700 pb-4 mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {post.title}
          </h1>
          <p className="text-sm text-gray-400">
            Publié le {displayDate} par <span className="text-indigo-400 font-medium">{post.author}</span>
          </p>
        </header>
        
        {/* -------------------- DÉBUT DU BLOC IMAGE (Correction Largeur et Hauteur) -------------------- */}
        {post.imageUrl && (
            // w-full pour 100% largeur. 
            // h-64 sur mobile, md:aspect-video sur desktop pour une hauteur limitée mais proportionnelle.
            // bg-slate-900 pour le fond très sombre derrière l'image non couverte.
            <div className="relative w-full h-64 md:aspect-video md:h-auto overflow-hidden rounded-lg shadow-xl mb-8 bg-slate-900">
                <Image
                    src={post.imageUrl}
                    alt={post.title} 
                    fill 
                    // NOUVEAU: 'object-contain' assure que l'image est entièrement visible 
                    // sans être déformée, utilisant le bg-slate-900 pour remplir l'espace vide.
                    style={{ objectFit: 'contain' }} 
                    priority 
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="transition-transform duration-500 hover:scale-105" 
                />
            </div>
        )}
        {/* -------------------- FIN DU BLOC IMAGE -------------------- */}

        {/* Affichage du contenu du post */}
        <div 
          // Utilisation de dangerouslySetInnerHTML pour injecter le contenu (potentiellement HTML/Markdown converti)
          className="prose prose-lg max-w-none text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content || post.description }} 
        />
        
        <div className="pt-6 border-t border-slate-700 mt-8">
            <a href="/" className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300">
                Retour à l'accueil
            </a>
        </div>
      </article>
    </div>
  );
}

// Fonction de génération des métadonnées
export async function generateMetadata({ 
    params,
}: PostPageProps) {
    // CORRECTION CRITIQUE : Utilisation de 'await' pour s'assurer que les params
    // sont résolus correctement.
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    // VÉRIFICATION DE SÉCURITÉ : Assurer que le slug est défini avant l'appel DB
    if (!slug) {
        // Retourne un titre par défaut si le slug est manquant
        return { title: 'Article Non Trouvé', description: 'Le paramètre de slug est manquant.' };
    }
    
  // Récupération des données pour les métadonnées (doit être awaité)
  const post: Post | null = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Article Non Trouvé', description: 'Le contenu de cet article est introuvable.' };
  }

  return {
    title: post.title,
    description: post.description || post.content.substring(0, 150) + '...',
  };
}