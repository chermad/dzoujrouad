"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  className = "",
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const [isQuillReady, setIsQuillReady] = useState(false);

  // Initialisation de Quill
  useEffect(() => {
    let isMounted = true;

    const initQuill = async () => {
      // Ne rien faire si pas monté ou déjà initialisé
      if (!isMounted || !containerRef.current || quillRef.current) return;

      try {
        // Import dynamique de Quill
        const Quill = (await import("quill")).default;

        if (!isMounted || !containerRef.current) return;

        // Créer un conteneur spécifique pour Quill
        const editorContainer = document.createElement("div");
        editorContainer.className = "quill-editor-container";
        containerRef.current.innerHTML = ""; // Nettoyer
        containerRef.current.appendChild(editorContainer);

        // Initialiser Quill
        quillRef.current = new Quill(editorContainer, {
          theme: "snow",
          placeholder: "Écrivez le contenu de l'article ici...",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image", "clean"],
            ],
          },
        });

        // Définir le contenu initial
        if (value && quillRef.current) {
          quillRef.current.root.innerHTML = value;
        }

        // Écouter les changements
        quillRef.current.on("text-change", () => {
          if (quillRef.current && isMounted) {
            const html = quillRef.current.root.innerHTML;
            onChange(html);
          }
        });

        setIsQuillReady(true);
      } catch (error) {
        console.error("Erreur d'initialisation de Quill:", error);
      }
    };

    initQuill();

    return () => {
      isMounted = false;
      if (quillRef.current) {
        try {
          quillRef.current.off("text-change");
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
        quillRef.current = null;
      }
      setIsQuillReady(false);
    };
  }, []); // Une seule initialisation

  // Synchroniser la valeur externe avec Quill
  useEffect(() => {
    if (quillRef.current && isQuillReady && value !== undefined) {
      // Ne mettre à jour que si le contenu est différent
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value, isQuillReady]);

  return (
    <div className={`min-h-[400px] ${className}`}>
      <div ref={containerRef} className="h-full" />
      
      {/* Indicateur de chargement */}
      {!isQuillReady && (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Chargement de l'éditeur...</p>
          </div>
        </div>
      )}
    </div>
  );
}