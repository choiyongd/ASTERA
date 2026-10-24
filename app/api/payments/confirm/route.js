import { learningContext } from "@/lib/learning/server";
import { firebaseAdminConfigured, firebaseAdminDb } from "@/lib/firebase/admin";
import { confirmTossPayment } from "@/lib/toss";
import { MEMBERSHIP_PLAN } from "@/lib/membership";
export async function POST(request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return Response.json({ error: "요청을 확인해주세요." }, { status: 403 });
    const { user } = await learningContext();
    if (!user)
      return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (
      !firebaseAdminConfigured() ||
      !process.env.TOSS_SECRET_KEY ||
      process.env.TOSS_SECRET_KEY.startsWith("YOUR_")
    )
      return Response.json(
        { error: "멤버십 결제 연결을 준비하고 있어요." },
        { status: 503 },
      );
    const { paymentKey, orderId, amount } = await request.json();
    if (
      typeof paymentKey !== "string" ||
      paymentKey.length > 300 ||
      typeof orderId !== "string" ||
      !/^astera_[A-Za-z0-9_-]+$/.test(orderId) ||
      !Number.isInteger(amount)
    )
      return Response.json(
        { error: "결제 요청 형식을 확인해주세요." },
        { status: 400 },
      );
    const db = firebaseAdminDb(),
      orderRef = db.collection("orders").doc(orderId),
      order = (await orderRef.get()).data();
    if (!order || order.user_id !== user.id)
      return Response.json(
        { error: "주문을 찾을 수 없어요." },
        { status: 404 },
      );
    if (order.amount !== amount)
      return Response.json({ error: "주문 금액이 다릅니다." }, { status: 400 });
    if (order.status === "paid")
      return Response.json({ ok: true, alreadyPaid: true });
    const payment = await confirmTossPayment({
      paymentKey,
      orderId,
      amount: order.amount,
    });
    if (payment.status !== "DONE")
      return Response.json(
        { error: "결제가 완료되지 않았어요." },
        { status: 400 },
      );
    await db.runTransaction(async (tx) => {
      const profileRef = db.collection("profiles").doc(user.id);
      const [latest, profile] = await Promise.all([
        tx.get(orderRef),
        tx.get(profileRef),
      ]);
      if (latest.data()?.status === "paid") return;
      const base = Math.max(
          Date.now(),
          Number(profile.data()?.membership_expires_at) || 0,
        ),
        expiry = base + MEMBERSHIP_PLAN.durationDays * 86400000;
      tx.update(orderRef, {
        status: "paid",
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
      });
      tx.set(
        profileRef,
        { is_member: true, membership_expires_at: expiry },
        { merge: true },
      );
    });
    return Response.json({ ok: true, payment: { status: payment.status } });
  } catch {
    return Response.json(
      {
        error:
          "결제 승인을 완료하지 못했어요. 결제 내역을 확인한 후 다시 시도해주세요.",
      },
      { status: 400 },
    );
  }
}
