import { Moon, Sun, Images } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  total?: number
  theme: "light" | "dark"
  onToggleTheme: () => void
}

export function Header({ total, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Images className="size-5" />
          </span>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            Vignesh bro meme&apos;s
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {total !== undefined && (
            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground tabular-nums">
              {total} {total === 1 ? "meme" : "memes"}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
