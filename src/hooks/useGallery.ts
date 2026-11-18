import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { fetchImageIndex } from "@/lib/github"

export const PAGE_SIZE = 12
const TEN_MINUTES = 10 * 60 * 1000

/**
 * Infinite query over the image list. The repo listing is fetched once
 * (and cached); each "page" is just the next slice of PAGE_SIZE images.
 */
export function useGallery() {
  const queryClient = useQueryClient()

  return useInfiniteQuery({
    queryKey: ["gallery"],
    initialPageParam: 0,
    staleTime: TEN_MINUTES,
    queryFn: async ({ pageParam }) => {
      const all = await queryClient.ensureQueryData({
        queryKey: ["gallery-index"],
        queryFn: fetchImageIndex,
        staleTime: TEN_MINUTES,
      })
      const end = pageParam + PAGE_SIZE
      return {
        items: all.slice(pageParam, end),
        total: all.length,
        nextOffset: end < all.length ? end : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })
}
