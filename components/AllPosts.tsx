import { getAllPosts } from "@/lib/firestore";
import PostCard from "./PostCard";

// Fonction pour extraire du texte propre d'un HTML (sans balises)
function extractTextFromHtml(html: string): string {
  if (!html) return '';
  
  // Supprime les balises HTML
  const text = html.replace(/<[^>]*>/g, '');
  
  // Supprime les espaces multiples
  return text.replace(/\s+/g, ' ').trim();
}

// Fonction pour créer un excerpt limité
function createExcerpt(html: string, maxLength: number = 160): string {
  const cleanText = extractTextFromHtml(html);
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Coupe à l'espace le plus proche
  const trimmed = cleanText.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? trimmed.substring(0, lastSpace) + '...' 
    : trimmed + '...';
}

export default async function AllPosts() {
  const allPosts = await getAllPosts();
  
  const publishedPosts = allPosts.filter(post => post.isPublished === true);
  const sortedPosts = publishedPosts.sort((a, b) => 
    b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
  );
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
      {posts.map(post => {
        // Créer un objet simple sans méthodes pour éviter les erreurs de sérialisation
        const postForClient = {
          id: post.id,
          slug: post.slug,
          title: post.title,
          // Utiliser la fonction pour créer un excerpt propre
          excerpt: createExcerpt(post.content || post.description || '', 160),
          imageUrl: post.imageUrl,
          author: post.author,
          description: post.description,
          // Convertir Timestamp en ISO string
          createdAt: post.createdAt.toDate().toISOString(),
          // Ajouter d'autres propriétés si nécessaire
          tags: post.tags || []
        };
        
        return <PostCard key={post.id} post={postForClient} />;
      })}
    </div>
  );
}