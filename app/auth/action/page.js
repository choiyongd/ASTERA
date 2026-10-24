import { Suspense } from "react";
import EmailAction from "./email-action";
export const metadata = {
  title: "이메일 인증 | ASTERA",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function EmailActionPage() {
  return (
    <main className="auth-wrap">
      <Suspense fallback={<p>인증 링크를 확인하고 있어요…</p>}>
        <EmailAction />
      </Suspense>
    </main>
  );
}
