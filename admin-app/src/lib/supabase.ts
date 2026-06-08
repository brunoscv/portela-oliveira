import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export type Post = {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
}

export type Profile = {
  id: string
  email: string
  role: 'admin' | 'editor'
  created_at: string
}
