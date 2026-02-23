'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createPost } from '@/app/actions/post'

const MAX_CHARS = 250

export default function NewPostPage() {
  const [content, setContent] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 글자 수 계산
  const charCount = content.length
  const isOverLimit = charCount > MAX_CHARS

  // 사진 선택 시 미리보기
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('사진 크기는 5MB 이하여야 해요!')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  // 사진 제거
  function removeImage() {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 글 제출
  async function handleSubmit(formData: FormData) {
    if (isOverLimit) {
      setError(`글은 ${MAX_CHARS}자를 넘을 수 없어요!`)
      return
    }
    if (!content.trim()) {
      setError('글 내용을 입력해주세요!')
      return
    }

    setLoading(true)
    setError(null)
    const result = await createPost(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← 취소
          </Link>
          <h1 className="text-base font-bold text-gray-800">새 글 작성</h1>
          <div className="w-12" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* 에러 메시지 */}
          {error && (
            <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit}>
            {/* 사진 업로드 영역 */}
            <div className="p-4 border-b border-gray-100">
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />

              {imagePreview ? (
                /* 사진 미리보기 (정사각형) */
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="미리보기"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-opacity-70"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                /* 사진 선택 버튼 */
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-sm text-gray-500">사진 추가하기</span>
                  <span className="text-xs text-gray-400 mt-1">jpg, png, webp, gif (5MB 이하)</span>
                </label>
              )}
            </div>

            {/* 글 작성 영역 */}
            <div className="p-4">
              <textarea
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="지금 어떤 생각을 하고 있나요? (최대 250자)"
                rows={5}
                className="w-full resize-none focus:outline-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed"
                maxLength={300} // 약간 여유 있게 설정 (서버에서 250자 제한)
              />

              {/* 글자 수 카운터 */}
              <div className="flex justify-end mt-2">
                <span className={`text-xs font-medium ${
                  isOverLimit
                    ? 'text-red-500'
                    : charCount > 220
                    ? 'text-orange-500'
                    : 'text-gray-400'
                }`}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="px-4 pb-4">
              <button
                type="submit"
                disabled={loading || isOverLimit || content.trim().length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '올리는 중...' : '게시하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
