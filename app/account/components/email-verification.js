"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { resendVerification, refreshVerification } from "@/lib/firebase/client";
import VerificationLinkForm from "../../auth/action/verification-link-form";
export default function EmailVerification({ next }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function act(check) {
    setBusy(true);
    setMessage("");
    try {
      if (check) {
        const verified = await refreshVerification();
        if (!verified)
          setMessage(
            "아직 인증 전이에요. 이메일의 인증 링크를 누른 뒤 다시 확인해주세요.",
          );
        else {
          setMessage("이메일 인증을 확인했어요.");
          if (next) router.replace(next);
          router.refresh();
        }
      } else {
        await resendVerification();
        setMessage(
          "인증 메일을 다시 보냈어요. 메일함과 스팸함을 확인해주세요.",
        );
      }
    } catch (error) {
      setMessage(error.message || "잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="learning-panel" aria-label="이메일 인증">
      <h2>이메일 인증을 완료해주세요</h2>
      <p>
        가입한 메일함의 인증 링크를 눌러주세요. 메일이 없으면 스팸함을
        확인하거나 다시 받을 수 있어요.
      </p>
      <div className="learning-actions">
        <button
          type="button"
          className="learning-button secondary"
          disabled={busy}
          onClick={() => act(false)}
        >
          인증 메일 다시 받기
        </button>
        <button
          type="button"
          className="learning-button"
          disabled={busy}
          onClick={() => act(true)}
        >
          {busy ? "확인 중…" : "인증 완료 확인"}
        </button>
      </div>
      <p role="status">{message}</p>
      <details>
        <summary>인증 링크에서 오류가 나나요?</summary>
        <VerificationLinkForm />
      </details>
    </section>
  );
}
