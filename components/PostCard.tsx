"use client";

import Link from "next/link";
import SmartImage from "./SmartImage";

export type PostCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  author?: string;
  description?: string;
  createdAt?: string;
};

type PostCardProps = {
  post: PostCardPost;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-slate-800 border border-slate-700">
        {/* Conteneur d'image */}
        <div className="relative w-full h-48">
          <SmartImage
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay sombre sur l'image pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60"></div>
          
          {/* Titre sur l'image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
              {post.title}
            </h3>
          </div>
        </div>

        {/* Contenu sous l'image */}
        <div className="p-4">
          {/* Excerpt */}
          <p className="text-sm text-gray-300 line-clamp-3 mb-3">
            {post.excerpt}
          </p>
          
          {/* Auteur et date */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-700">
            {post.author && (
              <p className="text-xs text-blue-300 font-medium">
                Par {post.author}
              </p>
            )}
            
            {post.createdAt && (
              <p className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}