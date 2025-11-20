import { getAllPosts } from "@/lib/firestore";
import PostCard from "./PostCard";

export default async function AllPosts() {
  const posts = await getAllPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Aucun article trouvé.
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
