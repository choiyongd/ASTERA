import { Suspense } from "react";
import NavBar from "../nav-bar";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <>
      <NavBar />
      <div className="auth-wrap">
        <Suspense fallback={<div className="auth-card">불러오는 중…</div>}>
          <LoginClient />
        </Suspense>
      </div>
    </>
  );
}
