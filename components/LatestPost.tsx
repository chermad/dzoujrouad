// components/LatestPost.tsx

import { getLatestPost } from '@/lib/firestore';
import Link from 'next/link';
import Image from 'next/image'; 
import { Post } from '@/lib/firestore'; 

export default async function LatestPost() {
  
  const post: Post | null = await getLatestPost();

  if (!post) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>Aucun article de blog n'a encore été publié.</p>
        <p className="mt-2 text-sm">Veuillez ajouter un document à la collection 'Blog' de Firestore.</p> 
      </div>
    );
  }

  const dateStr = post.createdAt?.toDate().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) || 'Date inconnue';
  
  const postUrl = `/posts/${post.slug || post.id}`;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 hover:border-blue-500 transition duration-300">
      
      {/* 🌟 CORRECTION : Utilisation de l'aspect-ratio pour une image 16:9 responsive */}
      {post.imageUrl && (
        <div className="mb-6 overflow-hidden rounded-lg">
          {/* Remplacer h-64 par aspect-video (16/9) ou aspect-w-16/aspect-h-9 pour un ratio plus classique de blog. */}
          {/* Si vous utilisez une version récente de Tailwind (v3+), aspect-video fonctionne directement. */}
          <div className="relative w-full aspect-video"> 
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              // object-cover garantit qu'il couvre le conteneur 16:9, coupant les bords si l'image originale a un ratio différent.
              className="object-cover" 
              sizes="(max-width: 1024px) 100vw, 768px"
              priority 
            />
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-3 text-blue-400">
        {post.title}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Publié le : {dateStr}
      </p>
      
      <div className="text-gray-300 leading-relaxed">
        <p>{post.description}</p>
      </div>

      <Link
        href={postUrl}
        className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-300"
      >
        Lire l'article complet
      </Link>
    </div>
  );
}