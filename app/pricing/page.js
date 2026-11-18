import Link from "next/link";
import NavBar from "../nav-bar";
import { MEMBERSHIP_PLAN } from "@/lib/membership";
import { membershipSalesReady } from "@/lib/membership-status";

export const metadata = {
  title: "요금제 — ASTERA",
};
export const dynamic = "force-dynamic";

export default function PricingPage() {
  const ready = membershipSalesReady();
  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>요금제</h1>
        <p>무료 LAB으로 먼저 탐구하고, 워크북 미리보기에서 활동을 살펴보세요.</p>
      </div>
      <div className="wrap" style={{ paddingBottom: 100 }}>
        <div className="paywall">
          <span className="eyebrow">{ready ? "워크북 멤버십" : "워크북 멤버십 · 출시 준비 중"}</span>
          <h2>{MEMBERSHIP_PLAN.name}</h2>
          <p>주제별 읽기와 탐구, 글쓰기 활동을 워크북으로 이어갑니다. 현재 제공되는 활동을 미리 확인해 보세요.</p>
          <div className="price-tag">
            {MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원<span> / {MEMBERSHIP_PLAN.durationDays}일</span>
          </div>
          <Link className="primary" href={ready ? "/checkout" : "/workbook"}>
            {ready ? "멤버십 시작하기" : "워크북 무료 미리보기"}
          </Link>
          <p className="membership-availability">
            {ready ? "1회 결제로 30일 동안 이용해요. 자동으로 갱신되지 않아요." : "19,900원은 30일 이용 예정 가격이에요. 결제와 제공 자료를 준비하고 있어요."}
          </p>
          <Link className="membership-free-link" href="/lab">무료 LAB 시작하기 →</Link>
        </div>
      </div>
    </>
  );
}
