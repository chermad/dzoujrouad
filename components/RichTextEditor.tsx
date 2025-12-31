"use client";

import { useEffect, useRef, useState, useCallback } from "react";


interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu ici...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation de Quill
  const initializeQuill = useCallback(async () => {
    if (!editorRef.current || quillInstanceRef.current) return;

    try {
      setIsLoading(true);
      console.log("🔄 Initialisation de Quill...");

      // Import dynamique
      const Quill = (await import("quill")).default;

      // Configuration de Quill
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      // Écouter les changements
      quillInstanceRef.current.on("text-change", () => {
        if (quillInstanceRef.current) {
          const content = quillInstanceRef.current.root.innerHTML;
          onChange(content);
        }
      });

      // Marquer comme prêt
      setIsReady(true);
      setIsLoading(false);
      console.log("✅ Quill initialisé");

    } catch (error) {
      console.error("❌ Erreur d'initialisation Quill:", error);
      setIsLoading(false);
    }
  }, [onChange, placeholder]);

  // Effet d'initialisation
  useEffect(() => {
    initializeQuill();

    return () => {
      if (quillInstanceRef.current) {
        try {
          quillInstanceRef.current.off("text-change");
        } catch (e) {
          // Ignorer
        }
        quillInstanceRef.current = null;
      }
      setIsReady(false);
    };
  }, [initializeQuill]);

  // Effet pour synchroniser la valeur externe
  useEffect(() => {
    if (quillInstanceRef.current && isReady && value !== undefined) {
      const currentContent = quillInstanceRef.current.root.innerHTML;
      
      // Mettre à jour uniquement si différent
      if (currentContent !== value) {
        console.log("📥 Injection du contenu dans Quill:", 
          value?.substring(0, 100) + "...");
        quillInstanceRef.current.root.innerHTML = value || "<p></p>";
      }
    }
  }, [value, isReady]);

  // Fonction pour forcer la mise à jour
  const forceUpdateContent = useCallback(() => {
    if (quillInstanceRef.current && value !== undefined) {
      console.log("🔧 Forcer la mise à jour du contenu");
      quillInstanceRef.current.root.innerHTML = value || "<p></p>";
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-slate-800/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white text-sm">Chargement de l'éditeur...</p>
          </div>
        </div>
      )}

      {/* Bouton de debug */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          type="button"
          onClick={forceUpdateContent}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded opacity-50 hover:opacity-100 transition-opacity"
          title="Forcer la mise à jour du contenu"
        >
          🔧
        </button>
        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
          {isReady ? "✅" : "🔄"}
        </span>
      </div>

      {/* Conteneur de l'éditeur */}
      <div 
        ref={editorRef} 
        className="min-h-[400px] bg-white text-black rounded-lg overflow-hidden"
      />

      {/* Informations de debug */}
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <span>
          {isReady ? "Éditeur prêt" : "Chargement..."} | 
          Contenu: {value?.length || 0} caractères
        </span>
        <span className="text-blue-400 cursor-help" title={value?.substring(0, 200)}>
          Aperçu
        </span>
      </div>
    </div>
  );
}