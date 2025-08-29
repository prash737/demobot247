import { createClient } from "@supabase/supabase-js"

// Use environment variables instead of hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zsivtypgrrcttzhtfjsf.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXZ0eXBncnJjdHR6aHRmanNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzU5NTUsImV4cCI6MjA1MzkxMTk1NX0.3cAMZ4LPTqgIc8z6D8LRkbZvEhP_ffI3Wka0-QDSIys"
const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
  : "http://localhost:3000/reset-password"

export const supabaseForgotPassword = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { "X-Supabase-Auth-Redirect-Url": redirectUrl },
  },
})
