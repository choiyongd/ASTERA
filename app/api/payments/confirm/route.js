import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmTossPayment } from "@/lib/toss";
import { MEMBERSHIP_PLAN } from "@/lib/membership";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { paymentKey, orderId, amount } = await request.json();
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 우리 DB에 저장해둔 주문과 대조해서, 결제 금액이 조작되지 않았는지 확인합니다.
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "주문 내역을 찾을 수 없습니다." }, { status: 404 });
  }
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }
  if (order.amount !== Number(amount)) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
  }

  try {
    const payment = await confirmTossPayment({ paymentKey, orderId, amount: order.amount });

    const paidAt = new Date();
    const expiresAt = new Date(paidAt.getTime() + MEMBERSHIP_PLAN.durationDays * 24 * 60 * 60 * 1000);

    await admin
      .from("orders")
      .update({ status: "paid", payment_key: paymentKey, paid_at: paidAt.toISOString() })
      .eq("order_id", orderId);

    await admin
      .from("profiles")
      .update({ is_member: true, membership_expires_at: expiresAt.toISOString() })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, payment: { status: payment.status } });
  } catch (err) {
    await admin.from("orders").update({ status: "failed" }).eq("order_id", orderId);
    return NextResponse.json({ error: err.message || "결제 승인에 실패했습니다." }, { status: 400 });
  }
}
