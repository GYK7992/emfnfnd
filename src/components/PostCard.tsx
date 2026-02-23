'use client'

import Image from 'next/image'
import { Post } from '@/types/database'
import { deletePost } from '@/app/actions/post'
import { useState } from 'react'

type PostCardProps = {
  post: Post
  currentUserId?: string
}

// 날짜를 한국어로 예쁘게 표시해주는 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [deleting, setDeleting] = useState(false)
  const isMyPost = currentUserId === post.user_id

  async function handleDelete() {
    if (!confirm('정말 이 글을 삭제할까요?')) return
    setDeleting(true)
    await deletePost(post.id)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${deleting ? 'opacity-50' : ''}`}>
      {/* 게시글 상단: 프로필 정보 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* 프로필 아이콘 (이니셜) */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
            {post.profiles?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {post.profiles?.username ?? '알 수 없음'}
            </p>
            <p className="text-gray-400 text-xs">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {/* 내 글이면 삭제 버튼 표시 */}
        {isMyPost && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 text-xs transition-colors disabled:opacity-50"
          >
            삭제
          </button>
        )}
      </div>

      {/* 사진 (정사각형으로 표시) */}
      {post.image_url && (
        <div className="relative w-full aspect-square">
          <Image
            src={post.image_url}
            alt="게시글 사진"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 576px"
          />
        </div>
      )}

      {/* 글 내용 */}
      <div className="px-4 py-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
    </div>
  )
}
