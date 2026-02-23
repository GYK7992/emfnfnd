import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버(백엔드)에서 Supabase에 연결하는 함수예요
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 서버 컴포넌트에서는 쿠키 설정이 안 될 수 있어요 - 괜찮아요!
          }
        },
      },
    }
  )
}
