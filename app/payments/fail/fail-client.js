"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FailClient() {
  const params = useSearchParams();
  const message = params.get("message") || "결제가 취소되었거나 실패했어요.";

  return (
    <div className="checkout-box" style={{ textAlign: "center" }}>
      <div className="form-msg error">{message}</div>
      <Link className="primary" href="/checkout">
        다시 시도하기
      </Link>
    </div>
  );
}
