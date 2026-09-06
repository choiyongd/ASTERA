import Link from "next/link";
import NavBar from "../nav-bar";
import { MEMBERSHIP_PLAN } from "@/lib/membership";

export const metadata = {
  title: "요금제 — ASTERA",
};

export default function PricingPage() {
  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>요금제</h1>
        <p>지금은 워크북 멤버십 한 가지로 시작합니다. 콘텐츠가 늘어나는 대로 요금제도 함께 넓혀갈 예정이에요.</p>
      </div>
      <div className="wrap" style={{ paddingBottom: 100 }}>
        <div className="paywall">
          <span className="eyebrow">워크북 멤버십</span>
          <h2>{MEMBERSHIP_PLAN.name}</h2>
          <p>읽기·생각·토론·쓰기·설계 워크시트 전체와 앞으로 추가되는 모든 질문 워크북을 자유롭게 이용할 수 있어요.</p>
          <div className="price-tag">
            {MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원<span> / {MEMBERSHIP_PLAN.durationDays}일</span>
          </div>
          <Link className="primary" href="/signup">
            무료로 둘러보기
          </Link>
          <p style={{ marginTop: 18, fontSize: 12.5, color: "#aab0d6" }}>
            결제 연동은 다음 단계에서 진행돼요. 지금은 회원가입 후 워크북 미리보기와 무료 콘텐츠를 먼저 이용해보세요.
          </p>
        </div>
      </div>
    </>
  );
}
