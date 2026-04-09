import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

/**
 * Use in Server Components, Server Actions, and Route Handlers.
 * Injects the Clerk session JWT so Supabase RLS can identify the user.
 *
 */
export function createServerSupabaseClient() {
  const { getToken } = auth()

  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: () => getToken(),
  })
}
