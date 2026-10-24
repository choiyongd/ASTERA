import Link from "next/link";
import EmailVerification from "../account/components/email-verification";
export default function AdminGate({ configured, user, unavailable = false }) {
  return (
    <main className="learning-shell">
      <p className="learning-kicker">ASTERA STUDIO</p>
      <h1>학습자료 관리</h1>
      {user && !user.emailVerified && !unavailable && (
        <EmailVerification next="/admin" />
      )}
      <section className="learning-panel learning-empty">
        <h2>
          {!configured
            ? "학습 저장소를 연결해주세요"
            : !user
              ? "관리자 계정으로 로그인해주세요"
              : unavailable
                ? "학습 데이터베이스 설정이 필요해요"
                : "관리자 권한이 필요해요"}
        </h2>
        <p>
          {!configured
            ? "Firebase 프로젝트의 연결 설정을 완료하면 자료를 등록할 수 있어요."
            : !user
              ? "자료 등록과 발행은 지정된 관리자만 할 수 있어요."
              : unavailable
                ? "운영자가 학습자료용 데이터베이스 설정을 완료해야 해요."
                : "로그인한 계정을 자료 관리자로 지정한 뒤 다시 접속해주세요."}
        </p>
        {!user && configured ? (
          <Link className="learning-button" href="/admin/login">
            로그인
          </Link>
        ) : (
          <Link className="learning-button secondary" href="/learn">
            학습 목록으로
          </Link>
        )}
        <details>
          <summary>운영자 설정 안내</summary>
          <p>
            docs/learning-setup.md 순서로 Firebase 연결과 Firestore·Storage
            규칙을 적용해주세요. 지정한 관리자 이메일로 가입하고 이메일 인증을
            완료하면 자료를 관리할 수 있어요. 비밀 키를 이 화면이나 대화에
            입력할 필요는 없어요.
          </p>
        </details>
      </section>
    </main>
  );
}
