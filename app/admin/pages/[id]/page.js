import { notFound } from "next/navigation";
import { learningContext, dbCheck } from "@/lib/learning/server";
import { UUID } from "@/lib/learning/domain.mjs";
import AdminGate from "../../admin-gate";
import PageEditor from "../page-editor";
export default async function EditPage({ params }) {
  const ctx = await learningContext();
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const { id } = await params;
  if (id === "new") return <PageEditor initial={null} />;
  if (!UUID.test(id)) notFound();
  const page = dbCheck(
    await ctx.db.from("site_pages").select("*").eq("id", id).maybeSingle(),
  );
  if (!page) notFound();
  return <PageEditor key={id} initial={page} />;
}
