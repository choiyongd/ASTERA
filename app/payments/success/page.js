import { Suspense } from "react";
import NavBar from "../../nav-bar";
import SuccessClient from "./success-client";

export default function PaymentSuccessPage() {
  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>결제 확인 중</h1>
      </div>
      <div className="wrap" style={{ paddingBottom: 100 }}>
        <Suspense fallback={<div className="checkout-box">불러오는 중…</div>}>
          <SuccessClient />
        </Suspense>
      </div>
    </>
  );
}
