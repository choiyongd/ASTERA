import "server-only";
import { cache } from "react";
import { firebaseSession } from "@/lib/firebase/server";
import { ALL_LAB_TOPICS } from "./catalog.mjs";
import { defaultLabContent, validateLabContent } from "./content.mjs";
import { dbCheck } from "@/lib/learning/server";

export const publishedLabContents = cache(async () => {
  const values = new Map();
  try {
    const session = await firebaseSession("");
    if (!session.db) return values;
    const result = await session.db
      .from("lab_content_publications")
      .select("*");
    if (result.error) throw new Error(result.error.code);
    for (const row of result.data) {
      if (!ALL_LAB_TOPICS.some((topic) => topic.id === row.id)) continue;
      try {
        values.set(row.id, {
          content: validateLabContent(JSON.parse(row.content_json), row.id),
          revision: row.revision,
          published_at: row.published_at,
        });
      } catch {
        console.error("Invalid published LAB content", row.id);
      }
    }
  } catch {
    console.error(
      "Published LAB content is unavailable; using built-in content.",
    );
  }
  return values;
});
export async function readLabContent(id) {
  const all = await publishedLabContents();
  return all.get(id) || { content: defaultLabContent(id), revision: 0 };
}
export async function readLabDraft(db, id) {
  const [draft, published] = await Promise.all([
    db.from("lab_content_drafts").select("*").eq("id", id).maybeSingle(),
    db.from("lab_content_publications").select("*").eq("id", id).maybeSingle(),
  ]);
  const row = dbCheck(draft),
    live = dbCheck(published);
  return {
    content: row
      ? validateLabContent(JSON.parse(row.draft_json), id)
      : defaultLabContent(id),
    revision: row?.revision || 0,
    publication: live
      ? {
          content: validateLabContent(JSON.parse(live.content_json), id),
          revision: live.revision,
        }
      : null,
  };
}
