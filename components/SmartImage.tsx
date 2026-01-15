"use client";

import { useState } from "react";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
};

export default function SmartImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/image-fallback.png",
  loading = "lazy",
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? fallbackSrc : src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
