import { useCallback, useMemo, useState } from "react"
import { Loader2, RefreshCw, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/Header"
import { ImageCard } from "@/components/ImageCard"
import { Lightbox } from "@/components/Lightbox"
import { useGallery, PAGE_SIZE } from "@/hooks/useGallery"
import { useInView } from "@/hooks/useInView"
import { useTheme } from "@/hooks/useTheme"

// 3 columns on large screens, 2 on medium, 1 on small
const GRID =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"

export default function App() {
  const { theme, toggle } = useTheme()
  const {
    data,
    error,
    status,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGallery()

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const images = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const sentinel = useInView<HTMLDivElement>(
    loadMore,
    Boolean(hasNextPage) && !isFetchingNextPage,
  )

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header total={total} theme={theme} onToggleTheme={toggle} />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        {status === "pending" && (
          <div className={GRID}>
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
            <ImageOff className="size-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Couldn&apos;t load the memes
            </h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
            <Button onClick={() => void refetch()}>
              <RefreshCw /> Try again
            </Button>
          </div>
        )}

        {status === "success" && images.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            No memes yet. Check back soon!
          </p>
        )}

        {status === "success" && images.length > 0 && (
          <>
            <div className={GRID}>
              {images.map((image, i) => (
                <ImageCard
                  key={image.name}
                  image={image}
                  onOpen={() => setOpenIndex(i)}
                />
              ))}
            </div>

            <div
              ref={sentinel}
              className="flex h-24 items-center justify-center"
            >
              {isFetchingNextPage && (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              )}
              {!hasNextPage && (
                <p className="text-sm text-muted-foreground">
                  You&apos;ve reached the end 🎉
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <Lightbox
        images={images}
        total={total ?? images.length}
        index={openIndex}
        hasMore={Boolean(hasNextPage)}
        loadMore={loadMore}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  )
}
