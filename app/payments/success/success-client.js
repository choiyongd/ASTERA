"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const params = useSearchParams();
  const [state, setState] = useState("confirming"); // confirming | done | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setState("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "결제 승인에 실패했습니다.");
        setState("done");
      })
      .catch((err) => {
        setState("error");
        setErrorMsg(err.message);
      });
  }, [params]);

  return (
    <div className="checkout-box" style={{ textAlign: "center" }}>
      {state === "confirming" && <p>결제를 확인하고 있어요…</p>}
      {state === "done" && (
        <>
          <div className="form-msg success">결제가 완료됐어요! 워크북 멤버십이 활성화되었습니다.</div>
          <Link className="primary" href="/workbook">
            워크북 보러 가기
          </Link>
        </>
      )}
      {state === "error" && (
        <>
          <div className="form-msg error">{errorMsg}</div>
          <Link className="secondary" href="/checkout">
            다시 시도하기
          </Link>
        </>
      )}
    </div>
  );
}
