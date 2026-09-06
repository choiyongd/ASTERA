// 토스페이먼츠 결제 승인 API 서버 호출 헬퍼.
// TOSS_SECRET_KEY는 절대 클라이언트로 전달하지 않습니다.
export async function confirmTossPayment({ paymentKey, orderId, amount }) {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "TOSS_SECRET_KEY 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요."
    );
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data?.message || "결제 승인에 실패했습니다.");
    err.code = data?.code;
    err.status = res.status;
    throw err;
  }

  return data; // 토스페이먼츠 Payment 객체
}
