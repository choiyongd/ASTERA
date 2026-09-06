"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: "이메일 또는 비밀번호가 올바르지 않아요." });
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="auth-card">
      <span className="eyebrow">ASTERA 로그인</span>
      <h1>다시 만나서 반가워요</h1>
      <p className="sub">가입할 때 사용한 이메일과 비밀번호로 로그인하세요.</p>

      {msg && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="parent@example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </div>
        <div className="form-actions">
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </div>
      </form>

      <div className="alt-action">
        아직 계정이 없으신가요? <Link href="/signup">회원가입</Link>
      </div>
    </div>
  );
}
