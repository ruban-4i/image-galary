const OWNER = "ruban-4i"
const REPO = "vignesh-meme-images"
const BRANCH = "main"

const IMAGE_FILE = /\.(png|jpe?g|jfif|avif|webp|gif|bmp|svg|heic|heif|tiff?)$/i

export interface GalleryImage {
  /** Position in the gallery (1 = first) */
  id: number
  /** File name without extension, e.g. "image (3)" */
  label: string
  /** Original file name, e.g. "3.avif" */
  name: string
  ext: string
  url: string
}

export const rawUrl = (fileName: string) =>
  `https://raw.githubusercontent.com/${OWNER}/${REPO}/refs/heads/${BRANCH}/${encodeURIComponent(fileName)}`

interface TreeResponse {
  tree: { path: string; type: string }[]
}

/**
 * One single GitHub API call that lists every file in the repo.
 * The real extension of each image comes from the listing, so we never have
 * to guess between png / jpg / jpeg / avif …
 * The Trees API (unlike the Contents API) is not capped at 1000 entries.
 */
export async function fetchImageIndex(): Promise<GalleryImage[]> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}`,
    { headers: { Accept: "application/vnd.github+json" } },
  )

  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      throw new Error(
        "GitHub API rate limit reached. Please try again in a few minutes.",
      )
    }
    throw new Error(`Could not load images (GitHub responded ${res.status}).`)
  }

  const data = (await res.json()) as TreeResponse

  return data.tree
    .filter((node) => node.type === "blob" && IMAGE_FILE.test(node.path))
    .map((node) => node.path)
    // natural sort: "image (2)" comes before "image (10)", and 2.png before 10.png
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    )
    .map(
      (name, i): GalleryImage => {
        const dot = name.lastIndexOf(".")
        return {
          id: i + 1,
          label: name.slice(0, dot),
          name,
          ext: name.slice(dot + 1).toLowerCase(),
          url: rawUrl(name),
        }
      },
    )
}

/** Saves the image with its original file name. */
export async function downloadImage(image: GalleryImage) {
  try {
    const res = await fetch(image.url)
    if (!res.ok) throw new Error(String(res.status))
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = image.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch {
    window.open(image.url, "_blank", "noopener")
  }
}
