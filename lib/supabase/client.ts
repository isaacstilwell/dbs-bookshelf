'use client'

import { useAuth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

/**
 * Use in Client Components. Returns a Supabase client that injects
 * the Clerk session JWT so Supabase RLS can identify the user.
 *
 */
export function useSupabaseClient() {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClient(supabaseUrl, supabaseAnonKey, {
        accessToken: () => getToken(),
      }),
    [getToken],
  )
}
