import { redirect } from "next/navigation";
import Link from "next/link";
import NavBar from "../nav-bar";
import { createClient } from "@/lib/supabase/server";
import { MEMBERSHIP_PLAN } from "@/lib/membership";

export default async function WorkbookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/workbook");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_member, membership_expires_at")
    .eq("id", user.id)
    .single();

  const isMember =
    profile?.is_member && profile?.membership_expires_at && new Date(profile.membership_expires_at) > new Date();

  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>가장 튼튼한 다리는 어떻게 만들까?</h1>
        <p>MAKE · ENGINEERING · 9–14세 · 35분 — 워크북 멤버십 전용 콘텐츠입니다.</p>
      </div>

      {!isMember && (
        <div className="wrap" style={{ paddingBottom: 90 }}>
          <div className="paywall">
            <span className="eyebrow">멤버십 전용</span>
            <h2>워크북을 계속 보려면 멤버십이 필요해요</h2>
            <p>
              읽기·생각·토론·쓰기·설계 워크시트 전체와 앞으로 추가되는 모든 질문 워크북을{" "}
              {MEMBERSHIP_PLAN.durationDays}일 동안 자유롭게 이용할 수 있어요.
            </p>
            <div className="price-tag">
              {MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원<span> / {MEMBERSHIP_PLAN.durationDays}일</span>
            </div>
            <Link className="primary" href="/checkout">
              멤버십 시작하기
            </Link>
          </div>
        </div>
      )}

      {isMember && (
        <div className="wrap" style={{ paddingBottom: 90 }}>
          <div className="worksheet-full">
            <h2>구조·압축력·인장력 워크시트</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              삼각형 구조와 트러스, 힘의 분산 원리를 배우고 직접 다리를 설계하며 개선합니다. 아래 질문에 순서대로
              답하며 나만의 다리를 설계해보세요.
            </p>
            <ol>
              <li>다리 위를 무거운 트럭이 지나갈 때, 다리의 어느 부분이 눌리고(압축) 어느 부분이 늘어날까요(인장)?</li>
              <li>삼각형 구조가 사각형 구조보다 더 튼튼한 이유를 나만의 말로 설명해보세요.</li>
              <li>종이와 빨대만으로 다리를 만든다면 어떤 구조를 선택할 건가요? 이유는 무엇인가요?</li>
              <li>내가 설계한 다리가 무너진다면, 가장 먼저 무너질 부분은 어디일까요? 왜 그렇게 생각하나요?</li>
              <li>실제 다리(한강대교, 금문교 등) 사진을 찾아보고 오늘 배운 구조가 어디에 쓰였는지 찾아보세요.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
