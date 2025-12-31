"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { createPost } from "@/lib/firestore-admin";
import RichTextEditor from "@/components/RichTextEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    author: "",
    description: "",
    imageUrl: "",
    isPublished: false,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  // 🔐 Vérification de l'authentification + rôle admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      try {
        const idTokenResult = await currentUser.getIdTokenResult();
        if (idTokenResult.claims.role === "admin") {
          setIsAdmin(true);
          setFormData((prev) => ({
            ...prev,
            author:
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "Admin",
          }));
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    });

    return unsubscribe;
  }, [router]);

  // 🔤 Génération automatique du slug
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  // 📝 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation du contenu (Quill)
    if (!formData.content || formData.content === "<p><br></p>") {
      alert("Le contenu de l'article est obligatoire");
      setLoading(false);
      return;
    }

    try {
      const postId = await createPost({
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
      });

      if (postId) {
        alert("Article créé avec succès !");
        router.push("/admin");
      } else {
        alert("Erreur lors de la création");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  // 🏷️ Gestion des tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // ⏳ Loading / sécurité
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un nouvel article
          </h1>
          <p className="text-gray-400">
            Remplissez le formulaire pour créer un nouvel article
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre et Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!formData.slug) {
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Auteur et Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Auteur *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 rounded-lg"
              >
                Ajouter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-700 rounded-full"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 📝 Contenu (Quill natif) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contenu *
            </label>

            <div className="bg-white text-black rounded-lg overflow-hidden border border-slate-700">
              <RichTextEditor
                value={formData.content}
                onChange={(html) =>
                  setFormData({ ...formData, content: html })
                }
              />
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Le contenu est généré automatiquement en HTML
            </p>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPublished: e.target.checked,
                  })
                }
              />
              Publier immédiatement
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="px-4 py-2 bg-slate-700 rounded-lg"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 rounded-lg disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer l'article"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
