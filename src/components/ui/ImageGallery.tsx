import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: string[]
  alt: string
}

function GalleryPlaceholder({ alt }: { alt: string }) {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="450" fill="#f4f4f5" />
      <text
        x="400"
        y="225"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#a1a1aa"
        fontSize="22"
        fontFamily="system-ui, sans-serif"
      >
        {alt}
      </text>
    </svg>
  )
}

export default function ImageGallery({ images, alt }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set())

  const count = images.length

  function prev() {
    setCurrentIndex((i) => (i === 0 ? count - 1 : i - 1))
  }

  function next() {
    setCurrentIndex((i) => (i === count - 1 ? 0 : i + 1))
  }

  const src = images[currentIndex]
  const usePlaceholder = !src || failedIndexes.has(currentIndex) || src.includes('placehold.co')

  return (
    <div className="relative aspect-video bg-zinc-100 rounded-lg overflow-hidden">
      {usePlaceholder ? (
        <GalleryPlaceholder alt={alt} />
      ) : (
        <img
          src={src}
          alt={`${alt} — photo ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          onError={() => setFailedIndexes((prev) => new Set(prev).add(currentIndex))}
        />
      )}

      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
          <span className="absolute bottom-2 right-2 bg-black/40 text-white text-xs font-mono px-2 py-0.5 rounded">
            {currentIndex + 1} / {count}
          </span>
        </>
      )}
    </div>
  )
}
