import Link from "next/link";
import SmartImage from "./SmartImage";

type PostCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    imageUrl: string;
  };
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="rounded-xl overflow-hidden bg-slate-800 hover:scale-[1.01] transition">
        <div className="relative h-56 w-full">
          <SmartImage
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-slate-300">
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}
