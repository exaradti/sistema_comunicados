import { createClient } from '@supabase/supabase-js'
import { get_env } from '@/lib/env'

export function get_supabase_admin() {
  return createClient(get_env('SUPABASE_URL'), get_env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
