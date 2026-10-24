import { notFound } from "next/navigation";
import { learningContext, dbCheck } from "@/lib/learning/server";
import { UUID } from "@/lib/learning/domain.mjs";
import AdminGate from "../../admin-gate";
import LessonEditor from "../lesson-editor";
export default async function EditLessonPage({ params }) {
  let ctx;
  try {
    ctx = await learningContext();
  } catch {
    return <AdminGate configured user unavailable />;
  }
  if (!ctx.admin) return <AdminGate {...ctx} />;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [lesson, assets, versions, catalog] = await Promise.all([
    ctx.db.from("learning_lessons").select("*").eq("id", id).maybeSingle(),
    ctx.db
      .from("learning_assets")
      .select("id,kind,original_name,external_url,ready,size")
      .eq("lesson_id", id)
      .eq("ready", true),
    ctx.db
      .from("learning_releases")
      .select("id,version,content,created_at")
      .eq("lesson_id", id)
      .order("version", { ascending: false }),
    ctx.db
      .from("learning_catalog")
      .select("*")
      .eq("lesson_id", id)
      .maybeSingle(),
  ]);
  dbCheck(lesson);
  dbCheck(assets);
  dbCheck(versions);
  dbCheck(catalog);
  if (!lesson.data) notFound();
  return (
    <LessonEditor
      key={id}
      initialLesson={lesson.data}
      initialAssets={assets.data}
      releases={versions.data}
      publication={catalog.data}
    />
  );
}
