import { learningContext, dbCheck, validId } from "@/lib/learning/server";
import { firebaseFile } from "@/lib/firebase/server";
export const dynamic = "force-dynamic";
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    validId(id);
    const ctx = await learningContext();
    if (!ctx.db)
      return new Response("파일 저장소 연결이 필요합니다.", { status: 503 });
    const asset = dbCheck(
      await ctx.db
        .from("learning_assets")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );
    if (!asset?.ready || !asset.object_path)
      return new Response("자료를 찾을 수 없습니다.", { status: 404 });
    const file = await firebaseFile(
      asset.object_path,
      ctx.token,
      asset.kind === "pdf" ? request.headers.get("range") : null,
    );
    const headers = {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Type":
        asset.kind === "pdf" ? "application/pdf" : "text/html; charset=utf-8",
      "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",
    };
    if (asset.kind === "html")
      headers["Content-Security-Policy"] =
        "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob: https:; font-src data:; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'";
    else {
      headers["Content-Disposition"] = "inline";
      for (const key of ["accept-ranges", "content-range", "content-length"])
        if (file.headers.has(key)) headers[key] = file.headers.get(key);
    }
    return new Response(file.body, { status: file.status, headers });
  } catch (error) {
    return new Response(
      error.status === 503
        ? "파일 저장소에 연결하지 못했습니다."
        : "자료를 찾을 수 없거나 이용 권한이 없습니다.",
      {
        status: error.status || 404,
        headers: { "Cache-Control": "private,no-store" },
      },
    );
  }
}
