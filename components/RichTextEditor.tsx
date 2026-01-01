"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu…",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null); // 👈 volontairement any
  const [ready, setReady] = useState(false);

  /**
   * 1️⃣ Initialisation de Quill (UNE SEULE FOIS)
   */
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    let mounted = true;

    const initQuill = async () => {
      const Quill = (await import("quill")).default as any;

      if (!mounted || !editorRef.current) return;

      // ----- FONTS -----
      const Font = Quill.import("formats/font");
      Font.whitelist = ["sans-serif", "serif", "monospace", "inter", "roboto"];
      Quill.register(Font, true);

      // ----- TAILLES -----
      const Size = Quill.import("attributors/style/size");
      Size.whitelist = ["12px", "14px", "16px", "18px", "24px", "32px", "48px"];
      Quill.register(Size, true);

      // ----- INSTANCE -----
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ font: Font.whitelist }],
            [{ size: Size.whitelist }],
            [{ header: [1, 2, 3, false] }],

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
        },
      });

      // ----- CONTENU INITIAL -----
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      // ----- CHANGE HANDLER -----
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        onChange(html === "<p><br></p>" ? "" : html);
      });

      quillRef.current = quill;
      setReady(true);
    };

    initQuill();

    return () => {
      mounted = false;
      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, []);

  /**
   * 2️⃣ Synchronisation valeur externe → Quill
   */
  useEffect(() => {
    if (!ready || !quillRef.current) return;

    const quill = quillRef.current;
    const currentHTML = quill.root.innerHTML;

    if (value !== currentHTML) {
      const selection = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(value || "");
      if (selection) {
        quill.setSelection(selection);
      }
    }
  }, [value, ready]);

  /**
   * 3️⃣ RENDER
   */
  return (
    <div className={`rich-text-editor-container ${className ?? ""}`}>
      <div
        ref={editorRef}
        className="quill-editor"
        style={{ minHeight: "300px" }}
      />

      {!ready && (
        <div className="text-sm text-gray-500 mt-2">
          Chargement de l’éditeur…
        </div>
      )}
    </div>
  );
}
