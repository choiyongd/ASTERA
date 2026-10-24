"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  checkActionCode,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { firebaseClient, refreshVerification } from "@/lib/firebase/client";
import VerificationLinkForm from "./verification-link-form";
const labels = {
  verifyEmail: "이메일 인증",
  resetPassword: "비밀번호 재설정",
  recoverEmail: "이메일 변경 취소",
};
export default function EmailAction() {
  const params = useSearchParams(),
    mode = params.get("mode"),
    code = params.get("oobCode");
  const [state, setState] = useState("checking"),
    [email, setEmail] = useState(""),
    [message, setMessage] = useState("");
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState("");
  useEffect(() => {
    let active = true;
    setMessage("");
    if (!mode && !code) {
      setState("entry");
      return;
    }
    setState("checking");
    async function check() {
      if (!Object.hasOwn(labels, mode) || !code || code.length > 2048)
        throw new Error(
          "인증 링크의 정보가 빠져 있어요. 가장 최근 받은 메일의 전체 링크를 열어주세요.",
        );
      const { auth } = firebaseClient();
      if (mode === "resetPassword") return verifyPasswordResetCode(auth, code);
      const info = await checkActionCode(auth, code);
      if (
        info.operation !==
        (mode === "verifyEmail" ? "VERIFY_EMAIL" : "RECOVER_EMAIL")
      )
        throw new Error(
          "인증 링크의 종류가 올바르지 않아요. 메일을 다시 요청해주세요.",
        );
      return info.data.email;
    }
    check()
      .then((value) => {
        if (active) {
          setEmail(value || "");
          setState("ready");
        }
      })
      .catch((error) => {
        if (active) {
          setState("error");
          setMessage(
            error.code
              ? "만료되었거나 이미 사용한 링크예요. 마이페이지에서 인증 상태를 확인하거나 새 메일을 요청해주세요."
              : error.message,
          );
        }
      });
    return () => {
      active = false;
    };
  }, [mode, code]);
  async function complete(event) {
    event.preventDefault();
    if (mode === "resetPassword" && password !== confirm) {
      setMessage("두 비밀번호가 일치하지 않아요.");
      return;
    }
    setState("saving");
    setMessage("");
    try {
      const { auth } = firebaseClient();
      if (mode === "resetPassword")
        await confirmPasswordReset(auth, code, password);
      else await applyActionCode(auth, code);
      if (mode === "verifyEmail" && auth.currentUser?.email === email) {
        try {
          await refreshVerification();
        } catch {
          /* Verification remains complete when a local session cannot be refreshed. */
        }
      }
      setState("done");
    } catch {
      setState("error");
      setMessage(
        "링크를 적용하지 못했어요. 만료되었거나 이미 사용한 링크일 수 있어요. 새 메일을 요청해주세요.",
      );
    }
  }
  return (
    <section className="auth-card">
      <span className="eyebrow">ASTERA ACCOUNT</span>
      <h1>
        {state === "done"
          ? "완료했어요"
          : Object.hasOwn(labels, mode)
            ? labels[mode]
            : "인증 링크 확인"}
      </h1>
      {state === "checking" ? (
        <p role="status">인증 링크를 확인하고 있어요…</p>
      ) : state === "done" ? (
        <>
          <p role="status">
            {mode === "verifyEmail"
              ? "이메일 인증을 완료했어요. 로그인한 계정의 인증 상태도 새로 확인할 수 있어요."
              : mode === "resetPassword"
                ? "새 비밀번호로 다시 로그인해주세요."
                : "이전 이메일 주소로 복구했어요."}
          </p>
          <div className="form-actions">
            <Link className="primary" href="/account">
              마이페이지로
            </Link>
            <Link href="/admin/login">관리자 로그인</Link>
          </div>
        </>
      ) : state === "entry" ? (
        <VerificationLinkForm />
      ) : state !== "error" ? (
        <form onSubmit={complete}>
          <p>{email}</p>
          <p>
            {mode === "verifyEmail"
              ? "아래 버튼을 누르면 이메일 인증이 완료돼요."
              : mode === "recoverEmail"
                ? "이 주소로 계정 이메일을 복구합니다."
                : "새 비밀번호를 입력해주세요."}
          </p>
          {mode === "resetPassword" && (
            <>
              <div className="field">
                <label htmlFor="new-password">새 비밀번호</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="confirm-password">새 비밀번호 확인</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="primary"
            disabled={state === "saving"}
          >
            {state === "saving"
              ? "처리 중…"
              : mode === "verifyEmail"
                ? "이메일 인증 완료하기"
                : mode === "resetPassword"
                  ? "비밀번호 저장"
                  : "이메일 복구하기"}
          </button>
        </form>
      ) : (
        <>
          <p role="alert">{message}</p>
          <VerificationLinkForm />
        </>
      )}
      {message && state !== "error" && <p role="alert">{message}</p>}
      <div className="alt-action">
        <Link href="/account">마이페이지에서 인증 메일 다시 받기</Link> ·{" "}
        <Link href="/login">로그인</Link>
      </div>
    </section>
  );
}
