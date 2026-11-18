import { useState } from "react"
import { ImageOff } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { GalleryImage } from "@/lib/github"

interface ImageCardProps {
  image: GalleryImage
  onOpen: () => void
}

export function ImageCard({ image, onOpen }: ImageCardProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  )

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open meme ${image.id}`}
      className="group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-xl border bg-muted shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      {status === "loading" && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="size-8" />
          <span className="text-xs">Couldn&apos;t load #{image.id}</span>
        </div>
      ) : (
        <img
          src={image.url}
          alt={`Meme ${image.id}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`size-full object-cover transition-all duration-500 group-hover:scale-105 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/70 via-black/20 to-transparent p-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100">
        <span className="text-sm font-semibold text-white">#{image.id}</span>
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white uppercase backdrop-blur">
          {image.ext}
        </span>
      </div>
    </button>
  )
}
