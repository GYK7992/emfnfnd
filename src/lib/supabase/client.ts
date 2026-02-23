import { createBrowserClient } from '@supabase/ssr'

// 브라우저(사용자 화면)에서 Supabase에 연결하는 함수예요
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
