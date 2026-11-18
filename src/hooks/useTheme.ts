import { useCallback, useEffect, useState } from "react"

type Theme = "light" | "dark"
const KEY = "meme-gallery-theme"

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch {
    /* storage unavailable */
  }
  return "dark"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  )
  return { theme, toggle }
}
