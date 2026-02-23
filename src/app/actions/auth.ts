'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// 로그인 액션
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: '이메일이나 비밀번호가 틀렸어요. 다시 확인해주세요!' }
  }

  redirect('/')
}

// 회원가입 액션
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // 1단계: 회원가입
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '이미 사용 중인 이메일이에요!' }
    }
    return { error: '회원가입에 실패했어요. 다시 시도해주세요!' }
  }

  // 2단계: 사용자 이름 업데이트
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', data.user.id)

    if (profileError) {
      // 사용자 이름이 중복될 수 있어요
      if (profileError.message.includes('unique')) {
        return { error: '이미 사용 중인 사용자 이름이에요!' }
      }
    }
  }

  redirect('/')
}

// 로그아웃 액션
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
