'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export type BookResult = {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
}

type WorkDetails = {
  description?: string | { value: string }
  first_publish_date?: string
  subjects?: string[]
}

type Props = {
  book: BookResult
  onClose: () => void
  onAdd: () => void
  isSaved: boolean
  isAdding: boolean
}

export default function BookModal({ book, onClose, onAdd, isSaved, isAdding }: Props) {
  const [details, setDetails] = useState<WorkDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://openlibrary.org${book.key}.json`)
      .then((r) => r.json())
      .then((data) => { setDetails(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [book.key])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const description = !details?.description
    ? null
    : typeof details.description === 'string'
      ? details.description
      : details.description.value

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black cursor-pointer" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-cream border-[3px] border-ink w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-terracotta shrink-0" />
            <span className="text-[9px] tracking-[0.35em] font-bold text-concrete">BOOK DETAIL</span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] tracking-[0.2em] font-bold text-concrete hover:text-terracotta transition-colors"
          >
            ESC ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row gap-6 p-6 overflow-y-auto">

          {/* Cover */}
          <div className="shrink-0 flex flex-col gap-3 items-start">
            <div className="relative w-36 sm:w-44 aspect-[2/3] border-2 border-ink bg-paper overflow-hidden">
              {book.cover_i ? (
                <Image
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full p-3 text-center text-[10px] text-concrete leading-tight tracking-wide">
                  {book.title}
                </div>
              )}
            </div>

            {/* Add button — lives under the cover */}
            <button
              onClick={onAdd}
              disabled={isSaved || isAdding}
              className="w-full border-[3px] border-ink bg-ink text-cream py-3 text-[10px] tracking-[0.25em] font-bold hover:bg-terracotta disabled:opacity-50 disabled:cursor-default transition-colors"
            >
              {isSaved ? '✓ IN COLLECTION' : isAdding ? '···' : '+ ADD TO COLLECTION'}
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 min-w-0 flex-1">
            <div>
              <h2 className="font-heading text-4xl leading-none tracking-[0.06em] text-ink mb-2">
                {book.title.toUpperCase()}
              </h2>
              {book.author_name?.[0] && (
                <p className="text-xs tracking-[0.2em] text-concrete uppercase">{book.author_name[0]}</p>
              )}
            </div>

            {details?.first_publish_date && (
              <div className="flex items-center gap-2 border-l-[3px] border-terracotta pl-3">
                <span className="text-[10px] tracking-[0.2em] text-concrete">
                  FIRST PUBLISHED — {details.first_publish_date}
                </span>
              </div>
            )}

            {loading && (
              <div className="space-y-2 animate-pulse pt-1">
                <div className="h-2.5 bg-paper w-full" />
                <div className="h-2.5 bg-paper w-5/6" />
                <div className="h-2.5 bg-paper w-4/6" />
                <div className="h-2.5 bg-paper w-5/6" />
              </div>
            )}

            {description && (
              <p className="text-[11px] leading-relaxed text-ink/70 border-t border-ink/10 pt-4">
                {description}
              </p>
            )}

            {details?.subjects && details.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-ink/10 pt-4">
                {details.subjects.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="text-[8px] tracking-[0.12em] border border-ink/25 px-2 py-0.5 text-concrete uppercase"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
