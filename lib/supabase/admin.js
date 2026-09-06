import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// service_role 키를 사용하는 관리자 클라이언트입니다.
// RLS(행 단위 보안 정책)를 무시하므로 반드시 서버 코드(API 라우트)에서만
// import 하세요. 클라이언트 컴포넌트에서 절대 불러오면 안 됩니다.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
