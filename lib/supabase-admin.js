import { createClient } from '@supabase/supabase-js'

// Server-side only — never import this in client components or pages directly.
// Use only in pages/api/* routes where this module is never bundled for the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
