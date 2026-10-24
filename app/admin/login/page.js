import { Suspense } from "react";
import LoginClient from "../../login/login-client";
export const metadata = { title: "관리자 로그인 | ASTERA" };
export default function AdminLoginPage() {
  return (
    <main className="auth-wrap">
      <Suspense fallback={<p>로그인을 준비하고 있어요…</p>}>
        <LoginClient adminMode defaultNext="/admin" />
      </Suspense>
    </main>
  );
}
