import "server-only";
import { firebaseSession } from "@/lib/firebase/server";
import { firebaseConfigured } from "@/lib/firebase/config";
import { ACCESS, UUID } from "./domain.mjs";

export class LearningError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
export const learningConfigured = firebaseConfigured;
export async function learningContext() {
  const session = await firebaseSession();
  if (!session.configured) return { ...session, profile: null, admin: false };
  const profile = session.user
    ? dbCheck(
        await session.db
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle(),
      )
    : null;
  const role = session.user?.emailVerified
    ? dbCheck(
        await session.db
          .from("learning_admins")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      )
    : null;
  const admin = Boolean(role);
  return { ...session, profile, admin };
}
export function dbCheck(result) {
  if (!result.error) return result.data;
  const { code, message = "" } = result.error;
  if (message.includes("REVISION_CONFLICT"))
    throw new LearningError(
      "다른 화면에서 변경한 내용이 있어요. 현재 기록을 보관하고 새로고침한 뒤 다시 시도해주세요.",
      409,
    );
  if (message.includes("SLUG_IMMUTABLE"))
    throw new LearningError("한 번 발행한 주제의 주소는 변경할 수 없어요.");
  if (message.includes("ASSET_NOT_READY"))
    throw new LearningError(
      "업로드가 끝나지 않은 자료가 있어요. 파일을 다시 확인해주세요.",
    );
  if (
    message.includes("FORBIDDEN") ||
    ["42501", "permission-denied"].includes(code)
  )
    throw new LearningError("이 자료를 이용할 권한이 없어요.", 403);
  if (["42P01", "42703", "PGRST205", "PGRST202"].includes(code))
    throw new LearningError(
      "학습 데이터베이스 설정이 필요해요. 관리자에게 문의해주세요.",
      503,
    );
  if (code === "23505" || message.includes("SLUG_TAKEN"))
    throw new LearningError(
      "이미 사용 중인 주소예요. 다른 주소를 입력해주세요.",
      409,
    );
  if (message.includes("INCOMPLETE") || message.includes("INVALID_PROGRESS"))
    throw new LearningError("입력한 내용과 앞 단계의 답변을 확인해주세요.");
  console.error("Learning database request failed", code);
  throw new LearningError(
    "저장소 요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.",
    503,
  );
}
export async function readJson(request) {
  if (Number(request.headers.get("content-length")) > 250000)
    throw new LearningError("입력 내용이 너무 길어요.", 413);
  const raw = await request.text();
  if (raw.length > 250000)
    throw new LearningError("입력 내용이 너무 길어요.", 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new LearningError("입력 형식을 확인해주세요.");
  }
}
export async function learningAction(request, action, admin = true) {
  try {
    const origin = request.headers.get("origin");
    if (
      request.headers.get("x-astera-action") !== "1" ||
      (origin && origin !== new URL(request.url).origin)
    )
      throw new LearningError("이 사이트에서 다시 시도해주세요.", 403);
    const ctx = await learningContext();
    if (!ctx.configured)
      throw new LearningError("학습 저장소 설정이 필요해요.", 503);
    if (!ctx.user) throw new LearningError("로그인 후 다시 시도해주세요.", 401);
    if (admin && !ctx.admin)
      throw new LearningError("자료 관리자만 사용할 수 있어요.", 403);
    const data = await action(ctx);
    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "요청을 처리하지 못했어요." },
      {
        status: error.status || 400,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
export function validId(id) {
  if (!UUID.test(id)) throw new LearningError("자료 주소를 확인해주세요.", 404);
  return id;
}
export async function catalogState(ctx) {
  if (!ctx.configured) return { items: [], setup: true };
  try {
    return {
      items: dbCheck(
        await ctx.db
          .from("learning_catalog")
          .select("*")
          .order("published_at", { ascending: false }),
      ),
      setup: false,
    };
  } catch (error) {
    if (error.status === 503) return { items: [], setup: true };
    throw error;
  }
}
export async function releaseMaterials(db, content) {
  const ids = content.materials.map((m) => m.id);
  if (!ids.length) return [];
  const rows = dbCheck(
    await db
      .from("learning_assets")
      .select("id,kind,original_name,external_url,ready,size,body_text")
      .in("id", ids),
  );
  return content.materials
    .map((m) => ({ ...m, ...rows.find((r) => r.id === m.id) }))
    .filter((m) => m.ready);
}
export { ACCESS };
