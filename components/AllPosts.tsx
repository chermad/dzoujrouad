import PostCard from "./PostCard";

type AllPostsProps = {
  posts: any[];
};

export default function AllPosts({ posts }: AllPostsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard
  key={post.id}
  post={{
    ...post,
    excerpt: post.description, // ✅ fallback propre
  }}
/>

      ))}
    </div>
  );
}
