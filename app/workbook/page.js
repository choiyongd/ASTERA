export const dynamic="force-dynamic";
import Link from "next/link";
import NavBar from "../nav-bar";
import { learningContext } from "@/lib/learning/server";
import { MEMBERSHIP_PLAN } from "@/lib/membership";
import { membershipSalesReady } from "@/lib/membership-status";

export default async function WorkbookPage() {
  const { profile } = await learningContext();
  const ready = membershipSalesReady();

  const isMember =
    profile?.is_member && profile?.membership_expires_at && new Date(profile.membership_expires_at) > new Date();

  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>가장 튼튼한 다리는 어떻게 만들까?</h1>
        <p>공학 · 초등 3–6학년·중학생 · 워크북 미리보기</p>
      </div>

      {!isMember && (
        <div className="wrap" style={{ paddingBottom: 90 }}>
          <div className="paywall">
            <span className="eyebrow">{ready ? "멤버십 전용" : "출시 준비 중"}</span>
            <h2>{ready ? "워크북과 함께 더 탐구해 보세요" : "워크북을 미리 살펴보세요"}</h2>
            <p>
              다리의 모양과 힘이 작용하는 곳을 살펴보고, 구조를 바꾸어 비교하는 활동을 준비하고 있어요.
            </p>
            <div className="price-tag">
              {MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원<span> / {MEMBERSHIP_PLAN.durationDays}일</span>
            </div>
            <Link className="primary" href={ready ? "/checkout" : "/lab/engineering-004"}>
              {ready ? "멤버십 시작하기" : "무료 다리 설계 LAB 해 보기"}
            </Link>
            {!ready && <p className="membership-availability">30일 이용 예정 가격이에요. 판매가 시작되면 요금제에서 확인할 수 있어요.</p>}
          </div>
        </div>
      )}

      <div className="wrap" style={{ paddingBottom: 90 }}>
        <section className="worksheet-full">
          <h2>먼저 생각해 볼 질문</h2>
          <p>다리를 지나는 짐의 무게가 무거워졌다고 생각해 보세요.</p>
          <ol>
            <li>다리의 어느 부분을 더 튼튼하게 해야 할까요? 먼저 이유를 적어 보세요.</li>
            <li>무료 LAB에서 같은 길이와 재료를 두고 구조를 바꾸어 보세요. 어떤 점이 달라졌나요?</li>
          </ol>
          <Link className="learning-text-link" href="/lab/engineering-004">모형을 바꾸어 비교하기 →</Link>
        </section>
      </div>
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
