import { Suspense } from "react";
import NavBar from "../../nav-bar";
import FailClient from "./fail-client";

export default function PaymentFailPage() {
  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>결제 실패</h1>
      </div>
      <div className="wrap" style={{ paddingBottom: 100 }}>
        <Suspense fallback={<div className="checkout-box">불러오는 중…</div>}>
          <FailClient />
        </Suspense>
      </div>
    </>
  );
}
