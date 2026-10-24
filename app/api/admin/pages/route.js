import { randomUUID } from "node:crypto";
import { learningAction, readJson, dbCheck } from "@/lib/learning/server";
import { validateSitePage } from "@/lib/learning/site-pages.mjs";
export async function POST(request) {
  return learningAction(request, async ({ db }) => {
    const { draft } = await readJson(request);
    return {
      page: dbCheck(
        await db
          .from("site_pages")
          .insert({
            id: randomUUID(),
            draft: validateSitePage(draft),
            revision: 1,
            published_slug: null,
          })
          .select()
          .single(),
      ),
    };
  });
}
