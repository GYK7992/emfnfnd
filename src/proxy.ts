import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 미들웨어: 모든 요청마다 실행돼요
// 로그인이 필요한 페이지에 접근하면 로그인 페이지로 보내줘요
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 현재 로그인한 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인 안 했는데 글쓰기 페이지에 가려고 하면 로그인 페이지로!
  if (!user && request.nextUrl.pathname.startsWith('/new-post')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 이미 로그인했는데 로그인/회원가입 페이지에 가면 메인으로!
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
