import { doc, runTransaction } from "firebase/firestore";
import {
  learningAction,
  readJson,
  validId,
  LearningError,
} from "@/lib/learning/server";
import { validateSitePage } from "@/lib/learning/site-pages.mjs";
export async function PATCH(request, { params }) {
  return learningAction(request, async ({ db }) => {
    const { id } = await params;
    validId(id);
    const input = await readJson(request);
    if (!Number.isInteger(input.revision) || input.revision < 1)
      throw new LearningError("페이지 버전을 확인해주세요.");
    return runTransaction(db.firestore, async (tx) => {
      const pageRef = doc(db.firestore, "site_pages", id),
        snapshot = await tx.get(pageRef);
      const page = snapshot.data();
      if (!page || page.revision !== input.revision)
        throw new LearningError(
          "다른 화면에서 수정한 내용이 있어요. 초안을 보관하고 새로고침해주세요.",
          409,
        );
      const date = new Date().toISOString();
      if (input.action === "unpublish") {
        if (page.published_slug)
          tx.delete(
            doc(db.firestore, "site_page_catalog", page.published_slug),
          );
        const updated = {
          ...page,
          revision: page.revision + 1,
          published: false,
          updated_at: date,
        };
        tx.set(pageRef, updated);
        return { page: updated };
      }
      if (input.action === "publish") {
        const draft = validateSitePage(page.draft, true);
        if (page.published_slug && page.published_slug !== draft.slug)
          throw new LearningError(
            "한 번 발행한 페이지 주소는 변경할 수 없어요.",
          );
        const slugRef = doc(db.firestore, "site_page_slugs", draft.slug),
          slug = await tx.get(slugRef);
        if (slug.exists() && slug.data().page_id !== id)
          throw new LearningError("이미 사용 중인 페이지 주소예요.", 409);
        const updated = {
          ...page,
          revision: page.revision + 1,
          published_slug: draft.slug,
          published: true,
          updated_at: date,
        };
        tx.set(doc(db.firestore, "site_page_catalog", draft.slug), {
          id: draft.slug,
          page_id: id,
          ...draft,
          published_at: date,
        });
        tx.set(slugRef, { page_id: id });
        tx.set(pageRef, updated);
        return { page: updated };
      }
      const updated = {
        ...page,
        draft: validateSitePage(input.draft),
        revision: page.revision + 1,
        updated_at: date,
      };
      tx.set(pageRef, updated);
      return { page: updated };
    });
  });
}
