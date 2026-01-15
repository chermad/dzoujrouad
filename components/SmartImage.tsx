// components/SmartImage.tsx - VERSION CORRIGÉE
"use client";

import { useState } from "react";

type SmartImageProps = {
  src?: string; // <-- Rendre optionnel avec ?
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  fill?: boolean; // <-- Ajouter si utilisé avec fill
};

export default function SmartImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/image-fallback.png",
  loading = "lazy",
  fill = false, // <-- Valeur par défaut
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  // Si pas de source ou erreur, utiliser le fallback
  const imageSrc = !src || hasError ? fallbackSrc : src;

  // Gérer le style pour fill
  const imageClassName = fill 
    ? `${className} object-cover w-full h-full`
    : className;

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={imageClassName}
      style={fill ? { position: "absolute", inset: 0 } : undefined}
    />
  );
}