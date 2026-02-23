import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import PostCard from '@/components/PostCard'
import { Post } from '@/types/database'

export default async function HomePage() {
  const supabase = await createClient()

  // 현재 로그인한 사용자 정보
  const { data: { user } } = await supabase.auth.getUser()

  // 모든 게시글 가져오기 (최신 순)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">emfnfnd</h1>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* 글쓰기 버튼 */}
                <Link
                  href="/new-post"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
                >
                  글쓰기
                </Link>

                {/* 로그아웃 버튼 */}
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-indigo-600 text-sm font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {/* 로그인 안 했을 때 배너 */}
        {!user && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6 text-center">
            <p className="text-indigo-700 font-medium mb-3">
              로그인하면 글을 쓸 수 있어요!
            </p>
            <div className="flex gap-2 justify-center">
              <Link
                href="/login"
                className="bg-white border border-indigo-300 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post as Post}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-lg font-medium">아직 글이 없어요</p>
            <p className="text-sm mt-1">첫 번째 글을 남겨보세요!</p>
          </div>
        )}
      </main>
    </div>
  )
}
