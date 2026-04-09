'use client'

import { useUser } from '@clerk/nextjs'
import { useSupabaseClient } from '@/lib/supabase/client'
import Header from '@/app/_components/header'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Favorite = {
  id: number
  title: string
  author: string | null
  cover_url: string | null
  ol_key: string | null
}

export default function Home() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    supabase
      .from('favorites')
      .select('id, title, author, cover_url, ol_key')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setFavorites(data)
      })
  }, [supabase])

  async function removeFavorite(fav: Favorite) {
    await supabase.from('favorites').delete().eq('id', fav.id)
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id))
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center gap-4 mb-8 pb-5 border-b-[3px] border-ink">
          <span className="w-3 h-3 bg-terracotta shrink-0" />
          <h1 className="font-heading text-5xl leading-none tracking-[0.12em] text-ink">
            THE COLLECTION
          </h1>
          <div className="flex-1 border-t-2 border-ink/15" />
          {favorites.length > 0 && (
            <span className="text-[10px] tracking-[0.3em] text-terracotta font-bold">
              {favorites.length} TITLES
            </span>
          )}
          <Link
            href="/search"
            className="text-[10px] tracking-[0.2em] font-bold border-2 border-ink px-3 py-2 hover:bg-ink hover:text-cream transition-colors"
          >
            + ADD BOOKS
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="border-[3px] border-ink border-dashed py-28 flex flex-col items-center justify-center gap-6">
            <p className="font-heading text-7xl text-ink/20 tracking-[0.2em]">EMPTY SHELF</p>
            <p className="text-xs tracking-[0.2em] text-concrete">NO TITLES IN THE COLLECTION YET</p>
            <Link
              href="/search"
              className="text-[10px] tracking-[0.25em] font-bold text-cream bg-ink px-6 py-3 hover:bg-terracotta transition-colors"
            >
              SEARCH THE CATALOG →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {favorites.map((fav) => (
              <div key={fav.id} className="group flex flex-col gap-1.5">
                <div className="relative aspect-[2/3] overflow-hidden border-2 border-ink bg-paper cursor-pointer">
                  {fav.cover_url ? (
                    <Image
                      src={fav.cover_url}
                      alt={fav.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 14vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-2 text-center text-[9px] text-concrete leading-tight tracking-wide">
                      {fav.title}
                    </div>
                  )}
                  {user && (
                    <button
                      onClick={() => removeFavorite(fav)}
                      className="absolute inset-0 flex items-center justify-center bg-terracotta/95 opacity-0 group-hover:opacity-100 transition-opacity text-cream text-[10px] font-bold tracking-[0.3em]"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
                <p className="text-[9px] leading-tight line-clamp-2 tracking-wide text-ink">{fav.title}</p>
                {fav.author && (
                  <p className="text-[9px] text-concrete truncate tracking-wide">{fav.author}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
