"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "../nav-bar";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // {type, text}

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: error.message });
      return;
    }

    if (data.session) {
      // 이메일 확인이 꺼져 있으면 가입과 동시에 로그인됩니다.
      router.push("/account");
      router.refresh();
      return;
    }

    setMsg({
      type: "success",
      text: "가입 확인 메일을 보냈어요. 메일함에서 링크를 눌러 인증을 완료해주세요.",
    });
  }

  return (
    <>
      <NavBar />
      <div className="auth-wrap">
        <div className="auth-card">
          <span className="eyebrow">ASTERA 회원가입</span>
          <h1>궁금함을 시작해요</h1>
          <p className="sub">이메일로 1분이면 가입이 끝나요. 워크북 이용을 위해 필요합니다.</p>

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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상"
              />
            </div>
            <div className="form-actions">
              <button className="primary" type="submit" disabled={loading}>
                {loading ? "가입 처리 중…" : "회원가입"}
              </button>
            </div>
          </form>

          <div className="alt-action">
            이미 계정이 있으신가요? <Link href="/login">로그인</Link>
          </div>
        </div>
      </div>
    </>
  );
}
