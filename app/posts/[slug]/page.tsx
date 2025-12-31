import { getPostBySlug } from "@/lib/firestore";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// 👉 Typage compatible Next.js 15
type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* ------------------------------------------------------------------ */
/* 🧠 Metadata dynamique (SEO)                                         */
/* ------------------------------------------------------------------ */
export async function generateMetadata(
  { params }: PostPageProps
): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article introuvable",
      description: "Cet article n’existe pas ou a été supprimé.",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

/* ------------------------------------------------------------------ */
/* 📄 Page Article                                                     */
/* ------------------------------------------------------------------ */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-slate-900 text-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          {post.title}
        </h1>

        {/* Auteur */}
        <p className="text-sm text-gray-400 mb-6">
          Par {post.author}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded-lg mb-8"
          />
        )}

        {/* Contenu HTML (Quill) */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-slate-700 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
