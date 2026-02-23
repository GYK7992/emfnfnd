-- =============================================
-- emfnfnd 소셜 미디어 데이터베이스 스키마
-- Supabase의 SQL Editor에서 이 코드를 실행하세요!
-- =============================================

-- 1. 사용자 프로필 테이블
-- (회원가입하면 자동으로 프로필이 만들어져요)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 게시글 테이블
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 250),  -- 250자 제한!
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 사진 저장소(Storage) 설정
-- posts-images라는 저장 공간을 만들어요
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict do nothing;

-- =============================================
-- 보안 설정 (RLS - Row Level Security)
-- 누가 무엇을 볼 수 있는지 정해요
-- =============================================

-- profiles 테이블 보안 켜기
alter table public.profiles enable row level security;

-- 누구나 프로필을 볼 수 있어요
create policy "프로필은 누구나 볼 수 있어요" on public.profiles
  for select using (true);

-- 본인만 자기 프로필을 만들 수 있어요
create policy "본인 프로필만 만들 수 있어요" on public.profiles
  for insert with check (auth.uid() = id);

-- 본인만 자기 프로필을 수정할 수 있어요
create policy "본인 프로필만 수정할 수 있어요" on public.profiles
  for update using (auth.uid() = id);

-- posts 테이블 보안 켜기
alter table public.posts enable row level security;

-- 누구나 게시글을 볼 수 있어요
create policy "게시글은 누구나 볼 수 있어요" on public.posts
  for select using (true);

-- 로그인한 사람만 글을 쓸 수 있어요
create policy "로그인한 사람만 글을 쓸 수 있어요" on public.posts
  for insert with check (auth.uid() = user_id);

-- 본인 글만 삭제할 수 있어요
create policy "본인 글만 삭제할 수 있어요" on public.posts
  for delete using (auth.uid() = user_id);

-- 사진 저장소 보안 설정
create policy "사진은 누구나 볼 수 있어요" on storage.objects
  for select using (bucket_id = 'post-images');

create policy "로그인한 사람만 사진을 올릴 수 있어요" on storage.objects
  for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

-- =============================================
-- 자동으로 프로필 만들기
-- 회원가입하면 자동으로 profiles 테이블에 추가돼요
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    -- 이메일에서 @ 앞부분을 기본 사용자 이름으로 사용해요
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 회원가입 시 위 함수가 자동으로 실행되도록 연결
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
