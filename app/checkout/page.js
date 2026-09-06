"use client";

import { useEffect, useRef, useState } from "react";
import NavBar from "../nav-bar";
import { MEMBERSHIP_PLAN } from "@/lib/membership";

export default function CheckoutPage() {
  const [status, setStatus] = useState("loading"); // loading | ready | error | needs-login
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const widgetRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      // 1) 서버에 주문을 먼저 만든다 (금액은 서버가 정함, 위조 방지)
      const orderRes = await fetch("/api/orders/create", { method: "POST" });
      if (orderRes.status === 401) {
        if (!cancelled) setStatus("needs-login");
        return;
      }
      if (!orderRes.ok) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("주문 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
        }
        return;
      }
      const orderData = await orderRes.json();
      if (cancelled) return;
      setOrder(orderData);

      // 2) 토스페이먼츠 결제위젯 SDK를 불러와 렌더링한다.
      const { loadPaymentWidget } = await import("@tosspayments/payment-widget-sdk");
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      const widget = await loadPaymentWidget(clientKey, orderData.customerEmail || "ANONYMOUS");
      if (cancelled) return;

      widget.renderPaymentMethods("#payment-widget", orderData.amount);
      widget.renderAgreement("#agreement");
      widgetRef.current = widget;
      setStatus("ready");
    }

    setup().catch((err) => {
      if (!cancelled) {
        setStatus("error");
        setErrorMsg(err.message || "결제창을 불러오지 못했어요.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePay() {
    if (!widgetRef.current || !order) return;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    try {
      await widgetRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${siteUrl}/payments/success`,
        failUrl: `${siteUrl}/payments/fail`,
        customerEmail: order.customerEmail,
      });
    } catch (err) {
      // 사용자가 결제창을 닫는 등 취소 케이스는 에러로 던져집니다.
      if (err?.code !== "USER_CANCEL") {
        setStatus("error");
        setErrorMsg(err?.message || "결제 요청 중 문제가 발생했어요.");
      }
    }
  }

  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>워크북 멤버십 결제</h1>
        <p>테스트 결제 환경입니다. 실제 카드가 청구되지 않습니다.</p>
      </div>

      <div className="wrap" style={{ paddingBottom: 100 }}>
        {status === "needs-login" && (
          <div className="checkout-box">
            <div className="form-msg info">결제하려면 먼저 로그인해주세요.</div>
            <a className="primary" href="/login?next=/checkout">
              로그인하러 가기
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="checkout-box">
            <div className="form-msg error">{errorMsg}</div>
          </div>
        )}

        {(status === "loading" || status === "ready") && (
          <div className="checkout-box">
            <div className="checkout-summary">
              <span className="name">{MEMBERSHIP_PLAN.name}</span>
              <span className="amount">{MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원</span>
            </div>
            <div id="payment-widget" />
            <div id="agreement" style={{ marginTop: 12 }} />
            <div className="form-actions">
              <button className="primary" onClick={handlePay} disabled={status !== "ready"}>
                {status === "ready" ? `${MEMBERSHIP_PLAN.amount.toLocaleString("ko-KR")}원 결제하기` : "결제창 불러오는 중…"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
