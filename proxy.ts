import { clerkMiddleware } from '@clerk/nextjs/server'

// All routes are public — auth is enforced at the action level
export const proxy = clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
