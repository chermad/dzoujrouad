"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getPostBySlug } from "@/lib/firestore";
import { updatePost } from "@/lib/firestore-admin";
import RichTextEditor from "@/components/RichTextEditor";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  description: string;
  imageUrl?: string;
  isPublished: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export default function EditPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [hasForceReloaded, setHasForceReloaded] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [postId, setPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Post | null>(null);
  const [tagInput, setTagInput] = useState("");
  
  // Référence pour stocker le contenu initial
  const initialContentRef = useRef<string>("");

  // Fonction pour générer un slug propre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Fonction pour charger les données
  const loadPostData = async () => {
    try {
      console.log("🔍 Chargement des données pour slug:", slug);
      const data = await getPostBySlug(slug);
      
      if (!data) {
        alert("Article introuvable");
        router.push("/admin");
        return null;
      }

      console.log("📦 Données récupérées:", {
        id: data.id,
        title: data.title,
        contentLength: data.content?.length || 0,
        contentPreview: data.content?.substring(0, 100)
      });

      const post: Post = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content || "<p></p>",
        author: data.author,
        description: data.description,
        imageUrl: data.imageUrl || "",
        isPublished: data.isPublished,
        tags: data.tags || [],
      };

      // Stocker le contenu dans la ref
      initialContentRef.current = data.content || "<p></p>";
      
      return post;
    } catch (error) {
      console.error("❌ Erreur lors du chargement:", error);
      throw error;
    }
  };

  // 🔐 Vérification admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      try {
        const token = await user.getIdTokenResult();
        if (token.claims.role !== "admin") {
          router.replace("/");
          return;
        }
        setCheckingAuth(false);
      } catch (error) {
        console.error("Erreur vérification admin:", error);
        router.replace("/");
      }
    });

    return () => unsub();
  }, [router]);

  // 📥 Premier chargement (chargement initial)
  useEffect(() => {
    if (!slug || checkingAuth) return;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const post = await loadPostData();
        
        if (post) {
          setPostId(post.id);
          setFormData(post);
          console.log("✅ Données initiales chargées");
        }
      } catch (error) {
        alert("Erreur lors du chargement de l'article");
        router.push("/admin");
      } finally {
        setLoading(false);
        // Marquer que le chargement initial est terminé
        setTimeout(() => {
          setIsInitialLoadComplete(true);
          console.log("🏁 Chargement initial terminé");
        }, 100);
      }
    };

    fetchInitialData();
  }, [slug, checkingAuth, router]);

  // 📥 Second chargement FORCÉ après que tout est prêt
  useEffect(() => {
    if (!isInitialLoadComplete || hasForceReloaded || !postId) return;

    console.log("🔄 Déclenchement du rechargement forcé...");

    const forceReloadContent = async () => {
      try {
        console.log("🔄 Rechargement des données pour remplir Quill...");
        const post = await loadPostData();
        
        if (post && formData) {
          // Mettre à jour uniquement le contenu
          setFormData({
            ...formData,
            content: post.content || "<p></p>"
          });
          console.log("✅ Contenu rechargé dans le formulaire");
        }
      } catch (error) {
        console.error("⚠️ Erreur lors du rechargement:", error);
      } finally {
        setHasForceReloaded(true);
        console.log("✅ Rechargement forcé terminé");
      }
    };

    // Délai pour s'assurer que Quill est initialisé
    const timer = setTimeout(() => {
      forceReloadContent();
    }, 500);

    return () => clearTimeout(timer);
  }, [isInitialLoadComplete, postId, hasForceReloaded, formData]);

  const handleAddTag = () => {
    if (
      tagInput.trim() &&
      formData &&
      !formData.tags.includes(tagInput.trim())
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !postId) return;

    // Validation
    if (!formData.title.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    if (!formData.content || 
        formData.content.trim() === "<p><br></p>" || 
        formData.content.trim() === "" ||
        formData.content.trim() === "<p></p>") {
      alert("Le contenu est obligatoire");
      return;
    }

    if (!formData.description.trim()) {
      alert("La description est obligatoire");
      return;
    }

    setSaving(true);

    try {
      // Préparer les données pour la mise à jour
      const payload = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        content: formData.content,
        author: formData.author,
        description: formData.description,
        imageUrl: formData.imageUrl || "",
        isPublished: formData.isPublished,
        tags: formData.tags,
      };

      const success = await updatePost(postId, payload);

      if (success) {
        alert("Article mis à jour avec succès !");
        router.push("/admin");
      } else {
        throw new Error("Échec de la mise à jour dans Firestore");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour : " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour forcer manuellement le rechargement
  const handleForceReload = async () => {
    setHasForceReloaded(false);
    setIsInitialLoadComplete(false);
    
    setTimeout(async () => {
      try {
        const post = await loadPostData();
        if (post && formData) {
          setFormData({
            ...formData,
            content: post.content || "<p></p>"
          });
          console.log("🔄 Rechargement manuel réussi");
        }
      } catch (error) {
        console.error("Erreur rechargement manuel:", error);
      } finally {
        setHasForceReloaded(true);
        setIsInitialLoadComplete(true);
      }
    }, 300);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Vérification des permissions</h2>
          <p className="text-gray-400">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement de l'article</h2>
          <p className="text-gray-400">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête avec bouton de rechargement */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Modifier l'article
                </span>
              </h1>
              <p className="text-gray-400">
                Modifiez les informations de l'article ci-dessous
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleForceReload}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              title="Recharger le contenu depuis la base de données"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recharger
            </button>
          </div>
          
          {/* Indicateurs de statut */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300">
              Post ID: {postId?.substring(0, 8)}...
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-900/50 text-green-300">
              Slug: {formData.slug}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-900/50 text-purple-300">
              {formData.isPublished ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Titre et Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
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
                      ...prev!,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="Titre de l'article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="slug-de-l-article"
              />
              <p className="text-xs text-gray-500 mt-2">
                Laissez vide pour générer automatiquement à partir du titre
              </p>
            </div>
          </div>

          {/* Auteur et Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Auteur *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="Nom de l'auteur"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Aperçu:</p>
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-700">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='80' viewBox='0 0 24 24' fill='%23374151'%3E%3Crect width='24' height='24' rx='4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='8' fill='%236b7280'%3EImage%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
              placeholder="Brève description de l'article"
            />
            <p className="text-xs text-gray-500 mt-2">
              Cette description apparaîtra dans les aperçus d'articles
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">+</span> Ajouter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-200 group"
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm"
                    title="Supprimer ce tag"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.tags.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Aucun tag ajouté. Ajoutez des tags pour faciliter la recherche.
                </p>
              )}
            </div>
          </div>

          {/* 📝 Contenu (RichTextEditor) */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Contenu *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Longueur: {formData.content?.length || 0} caractères
                </span>
                <button
                  type="button"
                  onClick={handleForceReload}
                  className="text-xs text-blue-400 hover:text-blue-300"
                  title="Recharger le contenu"
                >
                  ⟳ Recharger
                </button>
              </div>
            </div>
            
            <div className="bg-white text-black rounded-lg overflow-hidden border border-slate-700 shadow-lg">
              <RichTextEditor
                key={`editor-${postId}-${hasForceReloaded ? 'reloaded' : 'initial'}`}
                value={formData.content}
                onChange={(html) =>
                  setFormData({ ...formData, content: html })
                }
                className="min-h-[400px]"
              />
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-gray-400">
                Utilisez l'éditeur pour formater votre contenu.
              </p>
              <div className="text-xs">
                {!hasForceReloaded ? (
                  <span className="text-yellow-500">⏳ Chargement en cours...</span>
                ) : (
                  <span className="text-green-500">✓ Contenu chargé</span>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPublished: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-all duration-200 ${formData.isPublished ? 'bg-green-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${formData.isPublished ? 'left-5' : 'left-1'}`}></div>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {formData.isPublished ? 'Article publié' : 'Article en brouillon'}
                </span>
              </label>
              
              {formData.createdAt && (
                <div className="text-xs text-gray-500">
                  Créé le: {new Date(formData.createdAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sauvegarde en cours...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informations */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Débogage</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Post ID: <code className="bg-slate-900 px-2 py-1 rounded">{postId}</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Contenu initial: <code className="bg-slate-900 px-2 py-1 rounded">{initialContentRef.current?.length || 0} caractères</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Rechargement forcé: <code className="bg-slate-900 px-2 py-1 rounded">{hasForceReloaded ? "OUI" : "NON"}</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Chargement initial terminé: <code className="bg-slate-900 px-2 py-1 rounded">{isInitialLoadComplete ? "OUI" : "NON"}</code></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}