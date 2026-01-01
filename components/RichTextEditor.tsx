"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Compose your content...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const [isQuillLoaded, setIsQuillLoaded] = useState(false);

  // 1️⃣ Initialisation de Quill (UNE SEULE FOIS)
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    let mounted = true;
    let quillInstance: any = null;

    const initQuill = async () => {
      try {
        // Dynamic import pour réduire le bundle initial
        const Quill = (await import("quill")).default;

        if (!mounted || !editorRef.current) return;

        // Configuration des polices
        const Font = Quill.import("formats/font")as any;
        Font.whitelist = ["sans-serif", "serif", "monospace", "inter", "roboto"];
        Quill.register(Font, true);

        // Configuration des tailles
        const Size = Quill.import("attributors/style/size") as any;
        Size.whitelist = ["12px", "14px", "16px", "18px", "24px", "32px", "48px"];
        Quill.register(Size, true);

        // Création de l'instance Quill
        quillInstance = new Quill(editorRef.current, {
          theme: "snow",
          placeholder,
          modules: {
            toolbar: [
              [{ font: Font.whitelist }],
              [{ size: Size.whitelist }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ script: "sub" }, { script: "super" }],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ direction: "rtl" }, { align: [] }],
              ["link", "image", "video"],
              ["clean"],
            ],
            clipboard: {
              matchVisual: false,
            },
          },
        });

        // Gestion des changements de texte
        quillInstance.on("text-change", () => {
          if (onChange) {
            const html = quillInstance.root.innerHTML;
            // Éviter les appels inutiles
            if (html !== "<p><br></p>") {
              onChange(html);
            } else {
              onChange("");
            }
          }
        });

        // Contenu initial
        if (value && value.trim()) {
          quillInstance.clipboard.dangerouslyPasteHTML(value);
        }

        quillRef.current = quillInstance;
        setIsQuillLoaded(true);

      } catch (error) {
        console.error("Failed to initialize Quill:", error);
        if (mounted) {
          setIsQuillLoaded(false);
        }
      }
    };

    initQuill();

    return () => {
      mounted = false;
      if (quillInstance) {
        quillInstance.off("text-change");
      }
    };
  }, []);

  // 2️⃣ Synchronisation du contenu externe
  useEffect(() => {
    if (!quillRef.current || !isQuillLoaded) return;

    const quill = quillRef.current;
    const currentHTML = quill.root.innerHTML;

    // Comparaison en ignorant les différences de formatage HTML mineures
    const normalizeHTML = (html: string) => {
      return html
        .replace(/\s+/g, " ")
        .replace(/>\s+</g, "><")
        .trim();
    };

    const normalizedValue = normalizeHTML(value || "");
    const normalizedCurrent = normalizeHTML(currentHTML);

    if (normalizedValue !== normalizedCurrent && value !== undefined) {
      // Sauvegarder la position du curseur
      const selection = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(value || "");
      
      // Restaurer la position du curseur si possible
      if (selection) {
        setTimeout(() => {
          quill.setSelection(selection);
        }, 0);
      }
    }
  }, [value, isQuillLoaded]);

  // 3️⃣ Nettoyage
  useEffect(() => {
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rich-text-editor-container">
      <div 
        ref={editorRef} 
        className="quill-editor"
        style={{ minHeight: "200px" }}
      />
      {!isQuillLoaded && (
        <div className="quill-loading">
          Loading editor...
        </div>
      )}
    </div>
  );
}