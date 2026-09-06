import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// 모든 요청마다 실행되어 로그인 세션(토큰)을 갱신하고,
// 갱신된 쿠키를 응답에 실어 보냅니다. 이 파일이 없으면 세션이
// 만료되었을 때 로그인 상태가 갑자기 풀려버릴 수 있습니다.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션(토큰)이 유효한지 Supabase Auth 서버에 확인시켜 갱신을 트리거합니다.
  await supabase.auth.getUser();

  return response;
}
