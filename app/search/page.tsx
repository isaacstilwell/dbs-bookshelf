'use client'

import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase/client'
import Header from '@/app/_components/header'
import BookModal, { type BookResult } from '@/app/_components/book-modal'
import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookResult[]>([])
  const [searching, setSearching] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState<Set<string>>(new Set())
  const [selectedBook, setSelectedBook] = useState<BookResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('favorites')
      .select('ol_key')
      .then(({ data }) => {
        if (!data) return
        setSavedKeys(new Set(data.map((f) => f.ol_key).filter(Boolean) as string[]))
      })
  }, [user, supabase])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i&limit=18`,
    )
    const data = await res.json()
    setResults(data.docs ?? [])
    setSearching(false)
  }

  const addFavorite = useCallback(async (book: BookResult) => {
    if (!user) {
      sessionStorage.setItem('pendingFavorite', JSON.stringify(book))
      router.push('/sign-in?redirect_url=/search')
      return
    }
    setAdding((prev) => new Set([...prev, book.key]))
    const coverUrl = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null
    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      title: book.title,
      author: book.author_name?.[0] ?? null,
      cover_url: coverUrl,
      ol_key: book.key,
    })
    if (!error) {
      setSavedKeys((prev) => new Set([...prev, book.key]))
    }
    setAdding((prev) => {
      const next = new Set(prev)
      next.delete(book.key)
      return next
    })
  }, [user, supabase, router])

  // After sign-in redirect, check for a pending book to add
  useEffect(() => {
    if (!user) return
    const pending = sessionStorage.getItem('pendingFavorite')
    if (!pending) return
    sessionStorage.removeItem('pendingFavorite')
    addFavorite(JSON.parse(pending))
  }, [user, addFavorite])

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAdd={() => addFavorite(selectedBook)}
          isSaved={savedKeys.has(selectedBook.key)}
          isAdding={adding.has(selectedBook.key)}
        />
      )}

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero heading + search form */}
        <div className="border-b-[3px] border-ink pb-8 mb-8">
          <div className="flex items-end gap-4 mb-6">
            <span className="w-3 h-3 bg-terracotta shrink-0 mb-2" />
            <h1 className="font-heading text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-[0.08em] text-ink">
              SEARCH
            </h1>
            <span className="font-heading text-xl leading-none tracking-[0.2em] text-concrete mb-3">
              THE CATALOG
            </span>
          </div>

          <form onSubmit={search} className="flex">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="TITLE / AUTHOR / ISBN"
              className="flex-1 border-[3px] border-r-0 border-ink bg-cream px-5 py-4 text-xs tracking-[0.2em] placeholder:text-concrete/60 outline-none focus:bg-paper transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={searching}
              className="border-[3px] border-ink bg-ink text-cream px-8 py-4 text-[10px] tracking-[0.3em] font-bold hover:bg-terracotta disabled:opacity-50 transition-colors shrink-0"
            >
              {searching ? '···' : 'GO →'}
            </button>
          </form>
        </div>

        {/* Results count */}
        {!searching && results.length > 0 && (
          <p className="text-[10px] tracking-[0.3em] text-concrete mb-5">
            {results.length} RESULTS — &ldquo;{query.toUpperCase()}&rdquo;
          </p>
        )}

        {/* Skeleton */}
        {searching && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5 animate-pulse">
                <div className="aspect-[2/3] bg-paper border-2 border-ink/20" />
                <div className="h-2 bg-paper w-full" />
                <div className="h-2 bg-paper w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Results grid */}
        {!searching && results.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {results.map((book) => {
              const saved = savedKeys.has(book.key)
              const isAdding = adding.has(book.key)
              return (
                <div key={book.key} className="group flex flex-col gap-1.5">
                  {/* Cover — click to open modal */}
                  <div
                    className="relative aspect-[2/3] overflow-hidden border-2 border-ink bg-paper cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    {book.cover_i ? (
                      <Image
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 14vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-2 text-center text-[9px] text-concrete leading-tight tracking-wide">
                        {book.title}
                      </div>
                    )}

                    {/* Hover: "VIEW" overlay */}
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-colors flex items-center justify-center">
                      <span className="font-heading text-cream text-lg tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">
                        VIEW
                      </span>
                    </div>

                    {/* Quick add — bottom-right corner, stops propagation */}
                    {saved ? (
                      <div className="absolute bottom-0 inset-x-0 bg-terracotta flex items-center justify-center py-1 pointer-events-none">
                        <span className="text-cream text-[8px] font-bold tracking-[0.3em]">SAVED</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); addFavorite(book) }}
                        disabled={isAdding}
                        title="Quick add to collection"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-ink text-cream flex items-center justify-center text-base font-bold hover:bg-terracotta disabled:opacity-60 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {isAdding ? '·' : '+'}
                      </button>
                    )}
                  </div>

                  <p
                    className="text-[9px] leading-tight line-clamp-2 tracking-wide text-ink cursor-pointer hover:text-terracotta transition-colors"
                    onClick={() => setSelectedBook(book)}
                  >
                    {book.title}
                  </p>
                  {book.author_name?.[0] && (
                    <p className="text-[9px] text-concrete truncate tracking-wide">{book.author_name[0]}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* No results */}
        {!searching && results.length === 0 && query && (
          <div className="border-[3px] border-ink border-dashed py-20 flex flex-col items-center justify-center gap-3">
            <p className="font-heading text-5xl text-ink/20 tracking-[0.2em]">NO RESULTS</p>
            <p className="text-[10px] tracking-[0.3em] text-concrete">
              NOTHING FOUND FOR &ldquo;{query.toUpperCase()}&rdquo;
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
