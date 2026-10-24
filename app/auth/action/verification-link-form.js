"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { firebaseConfig } from "@/lib/firebase/config";
import { verificationPath } from "@/lib/firebase/email-link.mjs";
export default function VerificationLinkForm() {
  const router = useRouter();
  const [link, setLink] = useState(""),
    [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    try {
      router.push(
        verificationPath(
          link,
          firebaseConfig.authDomain,
          window.location.origin,
        ),
      );
      setError("");
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <form onSubmit={submit}>
      <p>
        인증 메일의 링크를 복사해 여기에 붙여넣으세요. 이 사이트에서 인증을
        이어갈 수 있어요.
      </p>
      <div className="field">
        <label htmlFor="verification-link">메일의 인증 링크</label>
        <input
          id="verification-link"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          required
          maxLength={8192}
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://…/__/auth/action?…"
        />
      </div>
      <button className="primary" type="submit">
        인증 링크 확인
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
