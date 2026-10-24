"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/firebase/client";
export default function LogoutButton() {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError(
        "로그아웃을 완료하지 못했어요. 연결을 확인하고 다시 시도해주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        className="learning-button secondary"
        disabled={busy}
        onClick={logout}
      >
        {busy ? "로그아웃 중…" : "로그아웃"}
      </button>
      {error && (
        <p role="alert" className="learning-hint">
          {error}
        </p>
      )}
    </div>
  );
}
