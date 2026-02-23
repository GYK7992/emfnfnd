// 데이터베이스에서 사용하는 타입(자료형)을 정의해요

// 사용자 프로필 타입
export type Profile = {
  id: string           // 고유 번호
  username: string     // 사용자 이름
  avatar_url: string | null  // 프로필 사진 URL
  created_at: string   // 가입일
}

// 게시글 타입
export type Post = {
  id: string              // 게시글 고유 번호
  user_id: string         // 작성자 고유 번호
  content: string         // 글 내용 (최대 250자)
  image_url: string | null // 사진 URL
  created_at: string      // 작성일
  profiles: Profile       // 작성자 정보 (조인해서 가져옴)
}
