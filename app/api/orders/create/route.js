import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_PLAN } from "@/lib/membership";

export async function POST() {
  // 1) 요청자가 실제로 로그인한 사용자인지 세션 쿠키로 확인합니다.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // 2) 주문 금액은 클라이언트가 아니라 서버(이 파일)에서 정합니다.
  //    이렇게 해야 브라우저에서 금액을 조작해 결제를 요청하는 걸 막을 수 있습니다.
  const orderId = `astera_${nanoid(16)}`;

  const admin = createAdminClient();
  const { error } = await admin.from("orders").insert({
    order_id: orderId,
    user_id: user.id,
    order_name: MEMBERSHIP_PLAN.name,
    amount: MEMBERSHIP_PLAN.amount,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orderId,
    orderName: MEMBERSHIP_PLAN.name,
    amount: MEMBERSHIP_PLAN.amount,
    customerEmail: user.email,
  });
}
