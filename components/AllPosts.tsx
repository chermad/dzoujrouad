import { getAllPosts } from "@/lib/firestore";
import PostCard from "./PostCard";

export default async function AllPosts() {
  const allPosts = await getAllPosts();
  
  // 1. Filtrer uniquement les articles publiés
  const publishedPosts = allPosts.filter(post => post.isPublished === true);
  
  // 2. Trier par date (du plus récent au plus ancien)
  const sortedPosts = publishedPosts.sort((a, b) => 
    b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
  );
  
  // 3. Exclure le dernier article (le plus récent) pour ne pas le dupliquer
  // Le dernier article est déjà affiché séparément dans LatestPost
  const posts = sortedPosts.length > 1 ? sortedPosts.slice(1) : sortedPosts;

  if (publishedPosts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Aucun article publié pour le moment.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>Le dernier article est affiché ci-dessus.</p>
        <p className="mt-2">Créez d'autres articles pour les voir apparaître ici.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}