import Link from "next/link";
import { getLatestPost } from "@/lib/firestore";
import SmartImage from "./SmartImage";

export default async function LatestPost() {
  const post = await getLatestPost();

  if (!post || !post.isPublished) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-slate-800 animate-pulse" />
    );
  }

  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
        <SmartImage
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50 flex items-end p-6">
          <h2 className="text-3xl font-bold text-white">
            {post.title}
          </h2>
        </div>
      </div>
    </Link>
  );
}
