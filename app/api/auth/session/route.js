import { cookies } from "next/headers";
import { firebaseSession } from "@/lib/firebase/server";
const COOKIE = "astera_session";
function check(request) {
  const origin = request.headers.get("origin");
  return (
    request.headers.get("x-astera-action") === "1" &&
    (!origin || origin === new URL(request.url).origin)
  );
}
export async function POST(request) {
  if (!check(request))
    return Response.json(
      { error: "이 사이트에서 로그인해주세요." },
      { status: 403 },
    );
  try {
    const input = await request.json();
    if (typeof input.idToken !== "string" || input.idToken.length > 10000)
      return Response.json(
        { error: "로그인을 다시 시도해주세요." },
        { status: 400 },
      );
    const ctx = await firebaseSession(input.idToken);
    if (!ctx.user)
      return Response.json(
        { error: "로그인을 확인하지 못했어요." },
        { status: 401 },
      );
    const profile = await ctx.db
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .maybeSingle();
    if (!profile.data) {
      const saved = await ctx.db
        .from("profiles")
        .insert({
          id: ctx.user.id,
          email: ctx.user.email,
          is_member: false,
          membership_expires_at: null,
        });
      if (saved.error && !saved.error.message?.includes("ALREADY_EXISTS"))
        throw new Error("PROFILE_SETUP");
    }
    (await cookies()).set(COOKIE, input.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3500,
    });
    return Response.json(
      { user: ctx.user },
      { headers: { "Cache-Control": "private,no-store" } },
    );
  } catch {
    return Response.json(
      { error: "로그인 연결을 확인해주세요." },
      { status: 503 },
    );
  }
}
export async function DELETE(request) {
  if (!check(request))
    return Response.json({ error: "요청을 확인해주세요." }, { status: 403 });
  (await cookies()).set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return Response.json({ ok: true });
}
