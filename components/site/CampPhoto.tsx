"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/site/photos";

// A photo with its illustrated scene underneath. The scene shows while the photo
// loads, and stays if the photo can't be loaded, so there is never a broken image.
export function CampPhoto({
  photo,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  photo: Photo;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // An error that fired before hydration never reaches onError; check once here.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  // Callers that pin the photo with `absolute` supply their own positioning.
  const position = /\babsolute\b/.test(className) ? "" : "relative";

  return (
    <div
      className={`${position} overflow-hidden bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(/images/scenes/${photo.scene}.svg)` }}
    >
      {!failed && (
        <Image
          ref={ref}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && <span className="sr-only">{photo.alt}</span>}
    </div>
  );
}
