// components/LatestPost.tsx

import { getAllPosts } from '@/lib/firestore'; // Utilisez getAllPosts au lieu de getLatestPost
import Link from 'next/link';
import Image from 'next/image'; 
import { Post } from '@/lib/firestore'; 

export default async function LatestPost() {
  const allPosts = await getAllPosts();
  
  // Filtrer uniquement les articles publiés
  const publishedPosts = allPosts.filter(post => post.isPublished === true);
  
  // Trier par date (du plus récent au plus ancien) et prendre le premier
  const sortedPosts = publishedPosts.sort((a, b) => 
    b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
  );
  
  const post = sortedPosts.length > 0 ? sortedPosts[0] : null;

  if (!post) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>Aucun article publié pour le moment.</p>
        <p className="mt-2 text-sm">Veuillez publier un article dans l'interface admin.</p> 
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
          <div className="relative w-full aspect-video"> 
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
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