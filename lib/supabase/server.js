import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트 / 라우트 핸들러에서 사용하는 Supabase 클라이언트.
// 요청의 쿠키에 담긴 로그인 세션을 읽고, 필요하면 토큰을 갱신합니다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 호출된 경우 쿠키를 쓸 수 없습니다.
            // middleware.js 가 세션 갱신을 담당하므로 여기서는 무시해도 안전합니다.
          }
        },
      },
    }
  );
}
