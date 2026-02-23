'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 글 작성 액션
export async function createPost(formData: FormData) {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요해요!' }
  }

  const content = formData.get('content') as string
  const imageFile = formData.get('image') as File

  // 글 내용 확인
  if (!content || content.trim().length === 0) {
    return { error: '글 내용을 입력해주세요!' }
  }

  if (content.length > 250) {
    return { error: '글은 250자를 넘을 수 없어요!' }
  }

  let imageUrl: string | null = null

  // 사진이 있으면 업로드
  if (imageFile && imageFile.size > 0) {
    // 파일 크기 확인 (5MB 이하)
    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: '사진 크기는 5MB 이하여야 해요!' }
    }

    // 파일 형식 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(imageFile.type)) {
      return { error: 'jpg, png, webp, gif 형식의 사진만 올릴 수 있어요!' }
    }

    // 파일 이름 만들기 (겹치지 않게 시간 + 사용자ID 사용)
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      return { error: '사진 업로드에 실패했어요. 다시 시도해주세요!' }
    }

    // 업로드된 사진의 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(uploadData.path)

    imageUrl = publicUrl
  }

  // 게시글 DB에 저장
  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: content.trim(),
      image_url: imageUrl,
    })

  if (error) {
    return { error: '글 저장에 실패했어요. 다시 시도해주세요!' }
  }

  // 메인 페이지 새로고침 후 이동
  revalidatePath('/')
  redirect('/')
}

// 글 삭제 액션
export async function deletePost(postId: string) {
  const supabase = await createClient()

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 내 글인지 확인 후 삭제
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)  // 반드시 내 글만 삭제!

  if (!error) {
    revalidatePath('/')
  }
}
