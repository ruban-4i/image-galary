import { useCallback, useEffect, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { downloadImage, type GalleryImage } from "@/lib/github"

interface LightboxProps {
  images: GalleryImage[]
  total: number
  index: number | null
  hasMore: boolean
  loadMore: () => void
  onIndexChange: (index: number) => void
  onClose: () => void
}

const barButton =
  "size-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"

export function Lightbox({
  images,
  total,
  index,
  hasMore,
  loadMore,
  onIndexChange,
  onClose,
}: LightboxProps) {
  const open = index !== null
  const image = index !== null ? images[index] : undefined

  const [actualSize, setActualSize] = useState(false)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const hasPrev = index !== null && index > 0
  const hasNext = index !== null && (index < images.length - 1 || hasMore)

  const goPrev = useCallback(() => {
    if (index !== null && index > 0) onIndexChange(index - 1)
  }, [index, onIndexChange])

  const goNext = useCallback(() => {
    if (index === null) return
    if (index < images.length - 1) onIndexChange(index + 1)
    else if (hasMore) loadMore()
  }, [index, images.length, hasMore, loadMore, onIndexChange])

  // Keep the next images loading while the user flips through the modal.
  useEffect(() => {
    if (index !== null && hasMore && index >= images.length - 3) loadMore()
  }, [index, images.length, hasMore, loadMore])

  // Warm the cache for neighbouring images so prev/next feels instant.
  useEffect(() => {
    if (index === null) return
    for (const n of [images[index - 1], images[index + 1]]) {
      if (n) new Image().src = n.url
    }
  }, [index, images])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, goPrev, goNext])

  const loading = image !== undefined && loadedUrl !== image.url

  const handleDownload = async () => {
    if (!image || downloading) return
    setDownloading(true)
    await downloadImage(image)
    setDownloading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setActualSize(false)
          onClose()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-black/95 p-0 text-white ring-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">
          {image ? `Meme ${image.id}` : "Meme"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Use the arrow keys to move between memes, Escape to close.
        </DialogDescription>

        {/* top bar */}
        <div className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0 text-sm">
            <span className="font-semibold">{image ? `#${image.id}` : ""}</span>
            {index !== null && (
              <span className="ml-3 text-white/60 tabular-nums">
                {index + 1} / {total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={barButton}
              onClick={() => setActualSize((v) => !v)}
              aria-label={actualSize ? "Fit to screen" : "View actual size"}
              title={actualSize ? "Fit to screen" : "View actual size"}
            >
              {actualSize ? <Minimize2 /> : <Maximize2 />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={barButton}
              onClick={handleDownload}
              disabled={downloading}
              aria-label="Download image"
              title="Download"
            >
              {downloading ? <Loader2 className="animate-spin" /> : <Download />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={barButton}
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              <X />
            </Button>
          </div>
        </div>

        {/* stage */}
        <div
          className={`relative flex min-h-0 flex-1 ${
            actualSize ? "overflow-auto" : "overflow-hidden"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const dx = e.changedTouches[0].clientX - touchStartX.current
            touchStartX.current = null
            if (Math.abs(dx) > 60) (dx < 0 ? goNext : goPrev)()
          }}
        >
          {image && (
            <img
              key={image.url}
              src={image.url}
              alt={`Meme ${image.id}`}
              draggable={false}
              onLoad={() => setLoadedUrl(image.url)}
              onError={() => {
                setLoadedUrl(image.url)
                setFailedUrl(image.url)
              }}
              onClick={(e) => e.stopPropagation()}
              className={`m-auto transition-opacity duration-300 ${
                loading ? "opacity-0" : "opacity-100"
              } ${
                actualSize
                  ? "max-w-none"
                  : "max-h-full max-w-full object-contain"
              }`}
            />
          )}

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="size-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              <span className="text-sm font-medium text-white/80">
                Loading image…
              </span>
            </div>
          )}

          {failedUrl !== null && image?.url === failedUrl && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
              <ImageOff className="size-12" />
              <span className="text-sm">Couldn&apos;t load this image</span>
            </div>
          )}
        </div>

        {hasPrev && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={goPrev}
            aria-label="Previous image"
            className={`${barButton} fixed top-1/2 left-3 size-11 -translate-y-1/2 backdrop-blur sm:left-6`}
          >
            <ChevronLeft className="size-6" />
          </Button>
        )}
        {hasNext && (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={goNext}
            aria-label="Next image"
            className={`${barButton} fixed top-1/2 right-3 size-11 -translate-y-1/2 backdrop-blur sm:right-6`}
          >
            <ChevronRight className="size-6" />
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
