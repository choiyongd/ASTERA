import { createHash } from "node:crypto";
import { firebaseAdminConfigured, firebaseAdminDb } from "@/lib/firebase/admin";
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      return Response.json(
        { error: "이메일을 확인해주세요." },
        { status: 400 },
      );
    if (!firebaseAdminConfigured())
      return Response.json(
        { error: "구독 연결을 준비하고 있어요." },
        { status: 503 },
      );
    const normalized = email.trim().toLowerCase(),
      id = createHash("sha256").update(normalized).digest("hex");
    await firebaseAdminDb()
      .collection("subscribers")
      .doc(id)
      .set(
        { email: normalized, updated_at: new Date().toISOString() },
        { merge: true },
      );
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "구독을 저장하지 못했어요. 잠시 후 다시 시도해주세요." },
      { status: 503 },
    );
  }
}
