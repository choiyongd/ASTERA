"use client";
export default function BrandReplayButton() {
  return <button type="button" className="brand-replay-button" onClick={() => window.dispatchEvent(new Event("astera:replay-intro"))}>브랜드 애니메이션 다시 보기 →</button>;
}
