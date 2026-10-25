import Link from "next/link";
export default function AdminNavigation() {
  return (
    <nav className="learning-admin-nav" aria-label="관리자 메뉴">
      <Link href="/admin">학습자료·과정</Link>
      <Link href="/admin/labs">LAB 질문·발문</Link>
      <Link href="/admin/pages">페이지 관리</Link>
      <Link href="/admin/members">회원·학습 현황</Link>
      <Link href="/account">마이페이지</Link>
    </nav>
  );
}
