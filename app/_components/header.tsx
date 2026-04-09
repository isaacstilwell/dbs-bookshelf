'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-ink text-cream border-b-4 border-terracotta">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          {/* MCM geometric accent — small square + larger square, offset */}
          <div className="relative w-5 h-5 shrink-0">
            <span className="absolute inset-0 bg-terracotta" />
            <span className="absolute top-1 left-1 w-3 h-3 border border-cream" />
          </div>
          <span className="font-heading text-3xl leading-none tracking-[0.15em] text-cream">
            BOOKSHELF
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1 text-[10px] tracking-[0.25em] uppercase font-bold">
            <Link
              href="/"
              className={`px-3 py-2 transition-colors ${
                pathname === '/'
                  ? 'bg-terracotta text-cream'
                  : 'text-cream/60 hover:text-cream hover:bg-cream/10'
              }`}
            >
              My Books
            </Link>
            <span className="text-cream/20 px-1">|</span>
            <Link
              href="/search"
              className={`px-3 py-2 transition-colors ${
                pathname === '/search'
                  ? 'bg-terracotta text-cream'
                  : 'text-cream/60 hover:text-cream hover:bg-cream/10'
              }`}
            >
              Search
            </Link>
          </nav>

          <div className="border-l-2 border-cream/20 pl-5">
            <UserButton />
          </div>
        </div>

      </div>
    </header>
  )
}
