import { nanoid } from "nanoid";
import { learningContext } from "@/lib/learning/server";
import { firebaseAdminConfigured, firebaseAdminDb } from "@/lib/firebase/admin";
import { MEMBERSHIP_PLAN } from "@/lib/membership";
export async function POST(request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return Response.json(
        { error: "이 사이트에서 다시 시도해주세요." },
        { status: 403 },
      );
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
    const orderId = `astera_${nanoid(16)}`,
      order = {
        order_id: orderId,
        user_id: user.id,
        order_name: MEMBERSHIP_PLAN.name,
        amount: MEMBERSHIP_PLAN.amount,
        status: "pending",
        created_at: new Date().toISOString(),
      };
    await firebaseAdminDb().collection("orders").doc(orderId).create(order);
    return Response.json({
      orderId,
      orderName: order.order_name,
      amount: order.amount,
      customerEmail: user.email,
    });
  } catch {
    return Response.json(
      { error: "주문을 만들지 못했어요. 잠시 후 다시 시도해주세요." },
      { status: 503 },
    );
  }
}
