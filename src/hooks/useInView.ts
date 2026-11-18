import { useEffect, useRef } from "react"

/** Calls `onVisible` whenever the returned ref's element nears the viewport. */
export function useInView<T extends Element>(
  onVisible: () => void,
  enabled: boolean,
) {
  const ref = useRef<T>(null)
  const callback = useRef(onVisible)

  useEffect(() => {
    callback.current = onVisible
  })

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) callback.current()
      },
      { rootMargin: "600px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return ref
}
